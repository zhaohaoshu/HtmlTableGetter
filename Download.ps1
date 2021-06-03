Invoke-WebRequest -Uri https://github.com/zhaohaoshu/HtmlTableGetter/archive/refs/heads/main.zip -OutFile .\HtmlTableGetter.zip
Expand-Archive -Path .\HtmlTableGetter.zip -Force
Compress-Archive -Path .\HtmlTableGetter\HtmlTableGetter-main\src\* -DestinationPath .\HtmlTableGetter\HtmlTableGetter.zip -Force