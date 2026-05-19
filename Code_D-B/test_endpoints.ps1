$base = 'http://localhost:5000'
$results = @()

function Test-Endpoint {
    param($method, $url, $desc, $body = $null, $expectedAlive = @(200,201,400,401,403,422))
    $fullUrl = $base + $url
    try {
        $params = @{
            Uri = $fullUrl
            Method = $method
            TimeoutSec = 5
            ErrorAction = 'Stop'
        }
        if ($body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = $body
        }
        $resp = Invoke-WebRequest @params
        return [PSCustomObject]@{
            Method = $method
            Endpoint = $url
            Description = $desc
            StatusCode = $resp.StatusCode
            Result = "✅ ALIVE ($($resp.StatusCode))"
        }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($null -eq $code) {
            return [PSCustomObject]@{
                Method = $method
                Endpoint = $url
                Description = $desc
                StatusCode = "N/A"
                Result = "❌ CONNECTION REFUSED / DOWN"
            }
        } elseif ($expectedAlive -contains $code) {
            $meaning = switch ($code) {
                401 { "Auth required" }
                403 { "Forbidden - Role check" }
                400 { "Validation error" }
                422 { "Unprocessable" }
                default { "Response $code" }
            }
            return [PSCustomObject]@{
                Method = $method
                Endpoint = $url
                Description = $desc
                StatusCode = $code
                Result = "✅ ALIVE ($code - $meaning)"
            }
        } else {
            return [PSCustomObject]@{
                Method = $method
                Endpoint = $url
                Description = $desc
                StatusCode = $code
                Result = "❌ ERROR ($code)"
            }
        }
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   BACKEND ENDPOINT VERIFICATION - http://localhost:5000" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# ─── PUBLIC / HEALTH ────────────────────────────────────────────────
Write-Host "[ PUBLIC / HEALTH ]" -ForegroundColor Yellow
$results += Test-Endpoint 'GET' '/health' 'Root Health Check'
$results += Test-Endpoint 'GET' '/api/v1/health' 'API v1 Health Check'
$results += Test-Endpoint 'GET' '/api/docs' 'Swagger UI'

# ─── AUTH ────────────────────────────────────────────────────────────
Write-Host "[ AUTH ]" -ForegroundColor Yellow
$results += Test-Endpoint 'POST' '/api/v1/auth/register' 'Register' '{}'
$results += Test-Endpoint 'POST' '/api/v1/auth/login' 'Login' '{}'
$results += Test-Endpoint 'POST' '/api/v1/auth/refresh' 'Refresh Token' '{}'
$results += Test-Endpoint 'POST' '/api/v1/auth/logout' 'Logout' '{}'
$results += Test-Endpoint 'POST' '/api/v1/auth/forgot-password' 'Forgot Password' '{}'
$results += Test-Endpoint 'POST' '/api/v1/auth/reset-password/dummytoken' 'Reset Password' '{}'
$results += Test-Endpoint 'PATCH' '/api/v1/auth/update-password' 'Update Password (Protected)' '{}'

# ─── STUDENT ─────────────────────────────────────────────────────────
Write-Host "[ STUDENT ]" -ForegroundColor Yellow
$results += Test-Endpoint 'GET' '/api/v1/student/profile' 'Get Profile'
$results += Test-Endpoint 'PUT' '/api/v1/student/profile' 'Update Profile' '{}'
$results += Test-Endpoint 'POST' '/api/v1/student/resume' 'Upload Resume'
$results += Test-Endpoint 'GET' '/api/v1/student/resume/analyze' 'Analyze Resume'
$results += Test-Endpoint 'GET' '/api/v1/student/roadmap' 'Get Roadmap'
$results += Test-Endpoint 'POST' '/api/v1/student/roadmap/generate' 'Generate Roadmap' '{}'
$results += Test-Endpoint 'GET' '/api/v1/student/progress' 'Get Progress'
$results += Test-Endpoint 'PUT' '/api/v1/student/progress' 'Update Progress' '{}'
$results += Test-Endpoint 'GET' '/api/v1/student/score' 'Get Score'
$results += Test-Endpoint 'GET' '/api/v1/student/recommendations' 'Get Recommendations'
$results += Test-Endpoint 'GET' '/api/v1/student/announcements' 'Get Student Announcements'
$results += Test-Endpoint 'POST' '/api/v1/student/announcements/dummyid/respond' 'Respond to Announcement' '{}'

# ─── HOD ─────────────────────────────────────────────────────────────
Write-Host "[ HOD ]" -ForegroundColor Yellow
$results += Test-Endpoint 'GET' '/api/v1/hod/students' 'List Students'
$results += Test-Endpoint 'GET' '/api/v1/hod/students/dummyid' 'Get Student Detail'
$results += Test-Endpoint 'GET' '/api/v1/hod/rankings' 'Rankings'
$results += Test-Endpoint 'GET' '/api/v1/hod/alerts' 'Alerts'
$results += Test-Endpoint 'GET' '/api/v1/hod/analytics' 'Analytics'
$results += Test-Endpoint 'GET' '/api/v1/hod/top-performers' 'Top Performers'
$results += Test-Endpoint 'GET' '/api/v1/hod/low-performers' 'Low Performers'
$results += Test-Endpoint 'POST' '/api/v1/hod/announcements' 'Create Announcement' '{}'
$results += Test-Endpoint 'GET' '/api/v1/hod/announcements' 'List Announcements'
$results += Test-Endpoint 'DELETE' '/api/v1/hod/announcements/dummyid' 'Delete Announcement'

# ─── AI ──────────────────────────────────────────────────────────────
Write-Host "[ AI ]" -ForegroundColor Yellow
$results += Test-Endpoint 'POST' '/api/v1/ai/chat' 'AI Chat' '{}'
$results += Test-Endpoint 'POST' '/api/v1/ai/generate-roadmap' 'AI Generate Roadmap' '{}'
$results += Test-Endpoint 'GET' '/api/v1/ai/recommend' 'AI Recommend'
$results += Test-Endpoint 'POST' '/api/v1/ai/analyze-resume' 'AI Analyze Resume'

# ─── INTEGRATIONS ────────────────────────────────────────────────────
Write-Host "[ INTEGRATIONS ]" -ForegroundColor Yellow
$results += Test-Endpoint 'GET' '/api/v1/integrations/github/callback' 'GitHub OAuth Callback'
$results += Test-Endpoint 'GET' '/api/v1/integrations/github/connect' 'GitHub Connect'
$results += Test-Endpoint 'GET' '/api/v1/integrations/status' 'Integration Status'
$results += Test-Endpoint 'POST' '/api/v1/integrations/github/sync' 'GitHub Sync' '{}'
$results += Test-Endpoint 'POST' '/api/v1/integrations/leetcode/sync' 'LeetCode Sync' '{}'
$results += Test-Endpoint 'GET' '/api/v1/integrations/resources?topic=react' 'Learning Resources'

# ─── NOTIFICATIONS ───────────────────────────────────────────────────
Write-Host "[ NOTIFICATIONS ]" -ForegroundColor Yellow
$results += Test-Endpoint 'GET' '/api/v1/notifications' 'Get Notifications'
$results += Test-Endpoint 'PUT' '/api/v1/notifications/mark-all' 'Mark All Read' '{}'
$results += Test-Endpoint 'PUT' '/api/v1/notifications/dummyid' 'Mark One Read' '{}'

# ─── SUMMARY ─────────────────────────────────────────────────────────
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                    RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize -Property Method, Endpoint, StatusCode, Result

$alive = ($results | Where-Object { $_.Result -like '*ALIVE*' }).Count
$down = ($results | Where-Object { $_.Result -like '*❌*' }).Count
$total = $results.Count

Write-Host "`n------------------------------------------------------------" -ForegroundColor Gray
Write-Host "  Total Endpoints : $total" -ForegroundColor White
Write-Host "  ✅ Alive        : $alive" -ForegroundColor Green
Write-Host "  ❌ Failed/Down  : $down" -ForegroundColor Red
Write-Host "------------------------------------------------------------`n" -ForegroundColor Gray
