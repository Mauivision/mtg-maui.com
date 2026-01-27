# Script to fix all error handling patterns in admin routes
# This ensures consistent error handling across all API routes

$files = @(
    "src\app\api\admin\roles\route.ts",
    "src\app\api\admin\players\route.ts",
    "src\app\api\admin\pairings\route.ts",
    "src\app\api\admin\news\route.ts",
    "src\app\api\admin\leaderboard\update\route.ts",
    "src\app\api\admin\leaderboard\recalculate\route.ts",
    "src\app\api\admin\games\route.ts",
    "src\app\api\admin\events\route.ts",
    "src\app\api\admin\drafts\route.ts",
    "src\app\api\admin\dashboard\activity\route.ts",
    "src\app\api\admin\bulk\system\route.ts",
    "src\app\api\admin\bulk\route.ts",
    "src\app\api\admin\bulk\players\route.ts",
    "src\app\api\admin\bulk\games\route.ts",
    "src\app\api\admin\bulk\events\route.ts"
)

Write-Host "Files to update: $($files.Count)" -ForegroundColor Cyan
