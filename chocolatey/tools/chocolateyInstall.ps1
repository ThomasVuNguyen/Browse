$packageName  = 'browse'
$installerType = 'exe'
$url           = 'REPLACE_WITH_URL_TO_YOUR_RELEASE_EXE'
$silentArgs    = '/S'
# If you want to bundle the exe inside the package instead of downloading, 
# uncomment the line below and put the exe in reading/tools
# $fileLocation = Join-Path $PSScriptRoot 'browse Setup 0.0.0.exe'

# For now, we will assume a download for a proper choco package
Install-ChocolateyPackage -PackageName $packageName `
                          -FileType $installerType `
                          -Url $url `
                          -SilentArgs $silentArgs
