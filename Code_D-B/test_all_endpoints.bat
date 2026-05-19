@echo off
set BASE=http://localhost:5000
set PASS=0
set FAIL=0

echo.
echo ============================================================
echo   BACKEND ENDPOINT VERIFICATION - %BASE%
echo ============================================================
echo.

echo [PUBLIC / HEALTH]
call :CHECK GET  /health                                        "Root Health Check"
call :CHECK GET  /api/v1/health                                 "API v1 Health Check"
call :CHECK GET  /api/docs                                      "Swagger UI Docs"

echo.
echo [AUTH ENDPOINTS]
call :CHECK_POST /api/v1/auth/register                          "POST Register"        "{}"
call :CHECK_POST /api/v1/auth/login                             "POST Login"           "{}"
call :CHECK_POST /api/v1/auth/refresh                           "POST Refresh Token"   "{}"
call :CHECK_POST /api/v1/auth/logout                            "POST Logout"          "{}"
call :CHECK_POST /api/v1/auth/forgot-password                   "POST Forgot Password" "{}"
call :CHECK_POST /api/v1/auth/reset-password/dummytoken         "POST Reset Password"  "{}"
call :CHECK_PATCH /api/v1/auth/update-password                  "PATCH Update Password" "{}"

echo.
echo [STUDENT ENDPOINTS - Protected, expect 401]
call :CHECK GET  /api/v1/student/profile                        "GET  Student Profile"
call :CHECK GET  /api/v1/student/resume/analyze                 "GET  Analyze Resume"
call :CHECK GET  /api/v1/student/roadmap                        "GET  Roadmap"
call :CHECK GET  /api/v1/student/progress                       "GET  Progress"
call :CHECK GET  /api/v1/student/score                          "GET  Score"
call :CHECK GET  /api/v1/student/recommendations                "GET  Recommendations"
call :CHECK GET  /api/v1/student/announcements                  "GET  Announcements"
call :CHECK_PUT  /api/v1/student/profile                        "PUT  Update Profile"   "{}"
call :CHECK_PUT  /api/v1/student/progress                       "PUT  Update Progress"  "{}"
call :CHECK_POST /api/v1/student/roadmap/generate               "POST Gen Roadmap"      "{}"
call :CHECK_POST /api/v1/student/announcements/xyz/respond      "POST Respond Announce" "{}"

echo.
echo [HOD ENDPOINTS - Protected, expect 401]
call :CHECK GET  /api/v1/hod/students                           "GET  HOD Students"
call :CHECK GET  /api/v1/hod/students/dummyid                   "GET  HOD Student Detail"
call :CHECK GET  /api/v1/hod/rankings                           "GET  HOD Rankings"
call :CHECK GET  /api/v1/hod/alerts                             "GET  HOD Alerts"
call :CHECK GET  /api/v1/hod/analytics                          "GET  HOD Analytics"
call :CHECK GET  /api/v1/hod/top-performers                     "GET  Top Performers"
call :CHECK GET  /api/v1/hod/low-performers                     "GET  Low Performers"
call :CHECK GET  /api/v1/hod/announcements                      "GET  HOD Announcements"
call :CHECK_POST /api/v1/hod/announcements                      "POST Create Announce"  "{}"
call :CHECK_DEL  /api/v1/hod/announcements/dummyid              "DEL  Delete Announce"

echo.
echo [AI ENDPOINTS - Protected, expect 401]
call :CHECK_POST /api/v1/ai/chat                                "POST AI Chat"          "{}"
call :CHECK_POST /api/v1/ai/generate-roadmap                    "POST AI Gen Roadmap"   "{}"
call :CHECK GET  /api/v1/ai/recommend                           "GET  AI Recommend"
call :CHECK_POST /api/v1/ai/analyze-resume                      "POST AI Analyze Resume" "{}"

echo.
echo [INTEGRATIONS ENDPOINTS]
call :CHECK GET  /api/v1/integrations/github/callback           "GET  GitHub Callback (no code)"
call :CHECK GET  /api/v1/integrations/github/connect            "GET  GitHub Connect"
call :CHECK GET  /api/v1/integrations/status                    "GET  Integration Status"
call :CHECK GET  "/api/v1/integrations/resources?topic=react"   "GET  Learning Resources"
call :CHECK_POST /api/v1/integrations/github/sync               "POST GitHub Sync"      "{}"
call :CHECK_POST /api/v1/integrations/leetcode/sync             "POST LeetCode Sync"    "{}"

echo.
echo [NOTIFICATION ENDPOINTS - Protected, expect 401]
call :CHECK GET  /api/v1/notifications                          "GET  Notifications"
call :CHECK_PUT  /api/v1/notifications/mark-all                 "PUT  Mark All Read"    "{}"
call :CHECK_PUT  /api/v1/notifications/dummyid                  "PUT  Mark One Read"    "{}"

echo.
echo ============================================================
echo   SUMMARY: %PASS% ALIVE  ^|  %FAIL% FAILED
echo ============================================================
echo.
goto :EOF

:: ── GET helper ──────────────────────────────────────────────────────────
:CHECK
for /f %%C in ('curl.exe --max-time 3 -s -o NUL -w "%%{http_code}" %BASE%%1') do set CODE=%%C
call :EVALUATE %1 %3 %CODE%
goto :EOF

:: ── POST helper ─────────────────────────────────────────────────────────
:CHECK_POST
for /f %%C in ('curl.exe --max-time 3 -s -o NUL -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d %3 %BASE%%1') do set CODE=%%C
call :EVALUATE %1 %2 %CODE%
goto :EOF

:: ── PUT helper ──────────────────────────────────────────────────────────
:CHECK_PUT
for /f %%C in ('curl.exe --max-time 3 -s -o NUL -w "%%{http_code}" -X PUT -H "Content-Type: application/json" -d %3 %BASE%%1') do set CODE=%%C
call :EVALUATE %1 %2 %CODE%
goto :EOF

:: ── PATCH helper ────────────────────────────────────────────────────────
:CHECK_PATCH
for /f %%C in ('curl.exe --max-time 3 -s -o NUL -w "%%{http_code}" -X PATCH -H "Content-Type: application/json" -d %3 %BASE%%1') do set CODE=%%C
call :EVALUATE %1 %2 %CODE%
goto :EOF

:: ── DELETE helper ───────────────────────────────────────────────────────
:CHECK_DEL
for /f %%C in ('curl.exe --max-time 3 -s -o NUL -w "%%{http_code}" -X DELETE %BASE%%1') do set CODE=%%C
call :EVALUATE %1 %2 %CODE%
goto :EOF

:: ── Status evaluator ────────────────────────────────────────────────────
:EVALUATE
set EP=%~1
set DESC=%~2
set SC=%~3
if "%SC%"=="000" (
    echo   [FAIL] %DESC% ^(%EP%^) -- CONNECTION REFUSED / TIMEOUT
    set /a FAIL+=1
) else if %SC% GEQ 200 if %SC% LSS 500 (
    echo   [OK  %SC%] %DESC% ^(%EP%^)
    set /a PASS+=1
) else (
    echo   [ERR %SC%] %DESC% ^(%EP%^)
    set /a FAIL+=1
)
goto :EOF
