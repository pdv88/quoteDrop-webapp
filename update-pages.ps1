# Script to update all pages to use Layout component
$pages = @('ClientDetails', 'CreateQuote', 'EditQuote', 'EditClient', 'Settings')

foreach ($page in $pages) {
    $file = "client/src/pages/$page.tsx"
    Write-Host "Processing $page..."
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Add Layout import if not present
        if ($content -notmatch 'import Layout from') {
            $content = $content -replace "(import.*from.*types';)", "`$1`nimport Layout from '../components/Layout';"
        }
        
        # Remove unused imports
        $content = $content -replace "import \{ useNavigate \} from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';"
        $content = $content -replace ", useNavigate", ""
        $content = $content -replace "import \{ .*?LayoutDashboard.*?LogOut.*? \} from 'lucide-react';", ""
        $content = $content -replace "import \{ authService \} from.*?;", ""
        
        # Remove handleLogout function
        $content = $content -replace "(?s)const handleLogout.*?};", ""
        
        # Remove navigate declaration
        $content = $content -replace "const navigate = useNavigate\(\);", ""
        
        # Replace sidebar section with Layout wrapper
        $content = $content -replace "(?s)<div className=`"min-h-screen bg-gray-50`">.*?<aside.*?</aside>.*?<main className=`"ml-64 p-8`">", "<Layout>`n      <div className=`"p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden`">"
        
        # Replace closing tags
        $content = $content -replace "</main>.*?</div>.*?(?=}\s*$)", "      </div>`n    </Layout>"
        
        # Remove NavLink function if present
        $content = $content -replace "(?s)function NavLink\(.*?\n}\n", ""
        
        Set-Content $file $content -NoNewline
        Write-Host "Updated $page successfully"
    }
}

Write-Host "All pages updated!"
