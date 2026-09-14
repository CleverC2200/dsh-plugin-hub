import {createElement as h,useEffect,useState} from 'react'
import styles from '../styles/DesktopUpdates.module.css'
type Settings={automatic:boolean;intervalHours:number;channel:'stable'|'test'}
type State={desktop?:boolean;phase?:string;checking?:boolean;checkError?:string|null;error?:string|null;lastCheck?:string;current?:Record<string,string>;settings?:Settings;releases?:{package:string;version:string;notes:{zh:string;en:string}}[]}
export function DesktopUpdates({lang}:{lang:string}) {
 const zh=lang.startsWith('zh');const say=(a:string,b:string)=>zh?a:b
 const [state,setState]=useState<State>({}),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const read=async()=>{const response=await fetch('/dsh-plugin-hub/desktop-updates',{cache:'no-store'});if(!response.ok)throw Error(say('桌面更新服务暂不可用','Desktop update service unavailable'));setState(await response.json())}
 useEffect(()=>{let live=true;const refresh=async()=>{try{const response=await fetch('/dsh-plugin-hub/desktop-updates',{cache:'no-store'});if(response.ok&&live)setState(await response.json())}catch{}};void refresh();const timer=setInterval(()=>void refresh(),2000);return()=>{live=false;clearInterval(timer)}},[])
 const action=async(action:string,value:unknown={})=>{if(busy)return;setBusy(true);setError('');try{const response=await fetch('/dsh-plugin-hub/desktop-updates',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,value})});const result=await response.json();if(!response.ok||result.error)throw Error(result.error??'UPDATE_FAILED');await read()}catch(error){setError(error instanceof Error?error.message:'UPDATE_FAILED')}finally{setBusy(false)}}
 if(!state.desktop)return null
 const running=busy||state.checking||['downloading','installing','restarting'].includes(state.phase??'')
 const labels:Record<string,string>={idle:say('尚未准备更新','No update prepared'),downloading:say('正在下载发行包…','Downloading release…'),installing:say('正在准备新版本，当前任务继续运行…','Preparing update; current tasks keep running…'),pending:say('准备完成，等待重启','Prepared; restart when ready'),restarting:say('正在重启并验证版本…','Restarting and verifying…'),succeeded:say('更新成功，当前已运行新版本','Update successful; new version is running'),failed:say('更新失败，当前可用版本已保留','Update failed; usable version preserved'),cancelled:say('已取消更新','Update cancelled')}
 const messages:Record<string,string>={RELEASE_HTTP_404:say('发行渠道不可访问，请联系管理员检查发布权限','Release channel unavailable; ask your administrator to check access'),RELEASE_HTTP_401:say('发行访问授权已失效，请联系管理员','Release authorization expired; contact your administrator'),UPDATE_ROLLED_BACK:say('新版本启动失败，已恢复上一版本','New version failed to start; previous version restored')}
 const names:Record<string,string>={'@cleverc2200/gea-dsh-prototype':say('GEA 业务工作台','GEA business workbench'),'@cleverc2200/dsh-agent-workbench':say('公共 Agent 工作台','Shared Agent workbench'),'dsh-plugin':say('公司插件市场','Company Plugin Hub'),'dsh-agent-manage':say('Agent 资源管理','Agent resource management')}
 const problem=error||state.checkError||state.error
 return h('section',{className:styles.root,'aria-label':say('公司桌面更新','Company desktop updates'),'data-desktop-updates':true},
  h('div',{className:styles.heading},h('strong',null,say('公司桌面更新','Company desktop updates')),h('button',{disabled:running,onClick:()=>void action('check')},state.checking?say('检查中…','Checking…'):say('检查更新','Check for updates'))),
  state.settings&&h('div',{className:styles.controls},
   h('label',null,h('input',{type:'checkbox',checked:state.settings.automatic,disabled:running,onChange:(event:React.ChangeEvent<HTMLInputElement>)=>void action('settings',{...state.settings,automatic:event.target.checked})}),say('自动检查','Check automatically')),
   h('label',null,say('渠道','Channel'),h('select',{value:state.settings.channel,disabled:running,onChange:(event:React.ChangeEvent<HTMLSelectElement>)=>void action('settings',{...state.settings,channel:event.target.value})},h('option',{value:'stable'},say('正式','Stable')),h('option',{value:'test'},say('测试','Test')))),
   h('label',null,say('检查间隔','Check interval'),h('select',{value:state.settings.intervalHours,disabled:running,onChange:(event:React.ChangeEvent<HTMLSelectElement>)=>void action('settings',{...state.settings,intervalHours:Number(event.target.value)})},...[1,6,24,168].map(hours=>h('option',{key:hours,value:hours},say(`${hours} 小时`,`${hours} hours`))))),
  ),
  h('p',{role:'status'},labels[state.phase??'idle']),
  problem&&h('p',{role:'alert'},messages[problem]??say('检查或更新未完成，请重试。原因：','Check or update could not finish. Retry. Reason: ')+problem),
  !state.checking&&!problem&&state.lastCheck&&!(state.releases??[]).some(r=>state.current?.[r.package]!==r.version)&&h('p',null,say('当前渠道暂无更新','No updates in the selected channel')),
  ...(state.releases??[]).map(release=>h('div',{key:release.package,className:styles.release},
   h('div',null,h('strong',null,names[release.package]??release.package),h('p',null,`${state.current?.[release.package]??say('未安装','Not installed')} → ${release.version} · ${say('兼容当前环境','Compatible with this environment')}`),h('p',null,zh?release.notes.zh:release.notes.en)),
   h('button',{disabled:running||state.phase==='pending'||state.current?.[release.package]===release.version,onClick:()=>void action('prepare',{package:release.package})},say('准备更新','Prepare update')))),
  ['downloading','installing','pending'].includes(state.phase??'')&&h('button',{disabled:busy,onClick:()=>void action('cancel')},say('取消更新','Cancel update')),
  state.phase==='pending'&&h('button',{disabled:busy,onClick:()=>void action('restart')},say('重启并应用（会停止当前任务）','Restart and apply (stops current tasks)')))
}
