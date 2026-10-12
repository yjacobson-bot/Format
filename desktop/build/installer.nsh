; Hebrew NSIS installer customization

!macro customHeader
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
  ; Remove LibreOffice Portable and all app data
  RMDir /r "$APPDATA\פורמט נקי\libreoffice"
!macroend
