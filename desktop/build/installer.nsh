; Hebrew string overrides for electron-builder NSIS installer
!macro customHeader
  !define MULTIUSER_TEXT_INSTALLMODE_TITLE "אפשרויות התקנה"
  !define MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "עבור מי להתקין את $(^Name)?"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_TEXT "כל המשתמשים במחשב זה"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT "רק עבורי"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_SUBTEXT "התקן עבור כולם (נדרשות הרשאות מנהל)"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_SUBTEXT "התקן רק למשתמש הנוכחי"
!macroend
