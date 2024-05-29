setlocal enabledelayedexpansion

REM Set the code page to UTF-8
chcp 65001 >nul

REM Check if the target directory is provided
if "%~1"=="" (
    echo Usage: %0 target_directory
    exit /b 1
)

REM Set the target directory from the first argument
set "targetDir=%~1"

REM Set the temporary output file path
set "tempOutputFile=%temp%\all_files_content.txt"

REM Clear the temporary output file if it already exists
if exist "%tempOutputFile%" del "%tempOutputFile%"

REM Function to process files
:processFiles
REM Process files in the current directory
for %%f in ("%~1\*.html" "%~1\*.ts" "%~1\*.css" "%~1\*.json" "%~1\*.js" "%~1\*.java") do (
    if exist "%%~f" (
        echo ####################################################### >> "%tempOutputFile%"
        echo Datei: %%~f >> "%tempOutputFile%"
        echo. >> "%tempOutputFile%"
        type "%%~f" >> "%tempOutputFile%"
        echo. >> "%tempOutputFile%"
    )
)

REM Recurse into subdirectories
for /d %%d in ("%~1\*") do (
    call :processFiles "%%~fd"
)

REM Wait until all processes are finished before copying to clipboard
REM Copy the content of the temporary output file to the clipboard
type "%tempOutputFile%" | clip

exit /b

REM Initial call to process files in the target directory and its subdirectories
call :processFiles "%targetDir%"

