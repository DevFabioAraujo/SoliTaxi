$body = Get-Content 'test_request.json' -Raw
$response = Invoke-WebRequest -Uri 'http://localhost:3001/export/download' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body
$response.Content | Out-File 'test_download.csv' -Encoding UTF8
Write-Host "Download concluído. Status: $($response.StatusCode)"
Write-Host "Tamanho do arquivo: $($response.Content.Length) bytes"
