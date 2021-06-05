param(
    $path = (Get-Location)
)    

[System.AppContext]::SetSwitch('Switch.System.IO.Compression.ZipFile.UseBackslash', $false)

$downloadedZipFileName = Join-Path $path HtmlTableGetter.zip
Invoke-WebRequest -Uri https://github.com/zhaohaoshu/HtmlTableGetter/archive/refs/heads/main.zip -OutFile $downloadedZipFileName

$expandedDirectoryName = Join-Path $path HtmlTableGetter
Remove-Item -Recurse $expandedDirectoryName -ErrorAction Ignore
Expand-Archive -Path $downloadedZipFileName -DestinationPath $expandedDirectoryName

$sourceDirectoryName = Join-Path $expandedDirectoryName HtmlTableGetter-main\src
$destinationArchiveFileName = Join-Path $path HtmlTableGetter\HtmlTableGetter.zip
Remove-Item $destinationArchiveFileName -ErrorAction Ignore
[System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDirectoryName, $destinationArchiveFileName)
