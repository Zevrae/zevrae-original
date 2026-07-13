$files = Get-ChildItem -Path d:\zevrae-original\src -Recurse -File -Include *.tsx,*.ts,*.css
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match '(?i)#0a0a0a') {
        $newContent = $content -ireplace '(?i)#0a0a0a', '#12100C'
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Output "Updated $($file.FullName)"
    }
}
