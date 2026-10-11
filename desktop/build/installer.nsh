; Hebrew NSIS installer customization

!macro customHeader
  ; Override multiuser page strings to Hebrew (must be at global scope)
  !ifdef MULTIUSER_TEXT_INSTALLMODE_TITLE
    !undef MULTIUSER_TEXT_INSTALLMODE_TITLE
  !endif
  !define MULTIUSER_TEXT_INSTALLMODE_TITLE "אפשרויות התקנה"

  !ifdef MULTIUSER_TEXT_INSTALLMODE_SUBTITLE
    !undef MULTIUSER_TEXT_INSTALLMODE_SUBTITLE
  !endif
  !define MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "עבור מי להתקין את $(^Name)?"

  !ifdef MULTIUSER_INSTALLMODE_ALLUSERS_TEXT
    !undef MULTIUSER_INSTALLMODE_ALLUSERS_TEXT
  !endif
  !define MULTIUSER_INSTALLMODE_ALLUSERS_TEXT "כל המשתמשים במחשב זה"

  !ifdef MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT
    !undef MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT
  !endif
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT "רק עבורי"
!macroend

!macro customInstall
  CreateShortCut "$DESKTOP\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateDirectory "$SMPROGRAMS\פורמט נקי"
  CreateShortCut "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateShortCut "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk" "$INSTDIR\Uninstall פורמט נקי.exe"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk"
  RMDir "$SMPROGRAMS\פורמט נקי"
!macroend
