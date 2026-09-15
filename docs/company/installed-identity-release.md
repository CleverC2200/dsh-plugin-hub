# Company Plugin Hub 1.4.3-company.5

Desktop-installed company plugins previously appeared as available to install because their local archive dependency specs contain no GitHub repository identity and their version-signal table can be empty. The catalog now declares an explicit installed package identity. Matching recognizes an existing file/link dependency without changing the npm/Git install target or claiming a dependency from a different Git repository.

Regression tests cover real desktop archive formats, an empty version-signal table, installed-list merging, absent dependencies, foreign Git sources, and preservation of install targets. Existing desktop update protections and other package versions remain unchanged.
