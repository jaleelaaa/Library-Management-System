# MCP Servers Setup Guide
## Shadcn, Playwright, and File System MCP Integration

**Version:** 1.0
**Created:** 2025-11-03
**Purpose:** Configure MCP servers for enhanced Claude Code capabilities

---

## 🔌 What are MCP Servers?

**Model Context Protocol (MCP)** servers are external services that extend Claude Code's capabilities by providing:
- Access to tools (browser automation, file operations)
- Context about frameworks (shadcn/ui documentation)
- Integration with external systems

**Important:** MCP servers run as separate processes. They are NOT installed in your project directory, but configured in Claude Code's settings.

---

## 📋 MCP Servers to Install

### 1. **Shadcn MCP Server**
- **Purpose:** Access shadcn/ui component documentation, examples, and installation guides
- **Official Package:** `shadcn-ui-mcp-server` (multiple implementations available)
- **Use Case:** Get component details, installation instructions, usage examples

### 2. **Playwright MCP Server**
- **Purpose:** Browser automation capabilities for testing and web scraping
- **Official Package:** `@playwright/mcp` (from Microsoft)
- **Use Case:** E2E testing, browser automation, accessibility tree access

### 3. **File System MCP Server**
- **Purpose:** Secure file operations with configurable access controls
- **Official Package:** `@modelcontextprotocol/server-filesystem`
- **Use Case:** Read/write files with directory-level permissions

---

## 🛠️ Installation Instructions

### Step 1: Locate Your Claude Code Configuration

MCP servers are configured in your Claude Code settings file, which is typically located at:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Create/Edit the Configuration File

If the file doesn't exist, create it. Here's the complete configuration for all 3 MCP servers:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["-y", "shadcn-ui-mcp-server"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "E:\\Library-Management Project\\lbs-enhance\\Library-Management-System"
      ]
    }
  }
}
```

**Important Notes:**
1. Replace the file path in `filesystem` with your actual project path
2. Use double backslashes (`\\`) for Windows paths in JSON
3. For macOS/Linux, use forward slashes: `/Users/username/project`

### Step 3: Restart Claude Code

After saving the configuration:
1. Close Claude Code completely
2. Restart Claude Code
3. MCP servers will start automatically

---

## 🎯 How to Use Each MCP Server

### 1. Shadcn MCP Server Usage

**Available Commands:**
- `list_shadcn_components` - Get list of all available components
- `get_component_details` - Get detailed info about a specific component
- `search_components` - Search for components by keyword

**Example Usage:**
```
"Show me how to use the shadcn/ui Button component"
"What are all the available shadcn/ui components?"
"Get installation instructions for the Dialog component"
```

**When to Use:**
- Implementing new UI components
- Looking up component APIs
- Getting installation commands for components
- Understanding component usage patterns

---

### 2. Playwright MCP Server Usage

**Available Tools:**
- `browser_navigate` - Navigate to a URL
- `browser_click` - Click an element
- `browser_type` - Type text into an input
- `browser_snapshot` - Get accessibility tree snapshot
- `browser_take_screenshot` - Capture screenshot
- `browser_evaluate` - Execute JavaScript in browser

**Example Usage:**
```
"Navigate to http://localhost:5173 and test the login flow"
"Click the 'Submit' button and verify the form submission"
"Take a screenshot of the dashboard page"
"Test if the Arabic language switcher works"
```

**When to Use:**
- E2E testing workflows
- Testing responsive design
- Validating form submissions
- Testing Arabic/RTL layouts
- Debugging UI issues

**Security Note:** Only use with localhost or trusted URLs during development.

---

### 3. File System MCP Server Usage

**Available Operations:**
- Read files from allowed directories
- Write files to allowed directories
- List directory contents
- Create directories
- Move/rename files
- Search files by pattern

**Example Usage:**
```
"Read the current frontend package.json"
"Create a new component file at frontend/src/components/NewComponent.tsx"
"List all TypeScript files in the components directory"
"Search for all files containing 'TODO' comments"
```

**When to Use:**
- Creating new files
- Reading configuration files
- Searching across multiple files
- Batch file operations

**Security Note:** Only directories specified in the configuration are accessible.

---

## 🔒 Security Considerations

### File System MCP Server
- **Default:** Only the specified project directory is accessible
- **Recommendation:** Don't add system-wide access (like `C:\` or `/`)
- **Best Practice:** Limit to project directory only

**Current Configuration:**
```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "E:\\Library-Management Project\\lbs-enhance\\Library-Management-System"
  ]
}
```

This limits access to ONLY your project directory.

### Playwright MCP Server
- **Default:** Can access any URL
- **Recommendation:** Only use with localhost during development
- **Production:** Do not use against production systems without authorization

---

## 🧪 Testing Your MCP Server Configuration

### Test 1: Verify Shadcn MCP is Working

Ask Claude Code:
```
"List all available shadcn/ui components"
```

**Expected Result:** Should return a list of components like Button, Card, Dialog, etc.

---

### Test 2: Verify Playwright MCP is Working

Ask Claude Code:
```
"Navigate to http://localhost:5173 and take a screenshot"
```

**Expected Result:** Should navigate to your dev server and return a screenshot.

**Note:** Your frontend dev server must be running first:
```bash
cd frontend
npm run dev
```

---

### Test 3: Verify File System MCP is Working

Ask Claude Code:
```
"Read the frontend/package.json file"
```

**Expected Result:** Should return the contents of package.json.

---

## 🐛 Troubleshooting

### Issue 1: MCP Servers Not Loading

**Symptoms:** Claude Code doesn't respond to MCP-related requests

**Solutions:**
1. Check JSON syntax in `claude_desktop_config.json` (use JSON validator)
2. Ensure file path uses double backslashes on Windows
3. Restart Claude Code completely
4. Check Claude Code logs (if available)

---

### Issue 2: "Command Not Found" Error

**Symptoms:** Error about npx or command not found

**Solutions:**
1. Ensure Node.js is installed: `node --version` (need 16+)
2. Ensure npx is available: `npx --version`
3. Add Node.js to your PATH environment variable
4. Restart Claude Code after PATH changes

---

### Issue 3: Playwright Browser Not Opening

**Symptoms:** Playwright commands fail or timeout

**Solutions:**
1. Install Playwright browsers manually:
   ```bash
   npx playwright install
   ```
2. Ensure no firewall blocking browser processes
3. Try with a simple URL first: `http://localhost:5173`

---

### Issue 4: File System Access Denied

**Symptoms:** Cannot read/write files

**Solutions:**
1. Verify the directory path in config is correct
2. Use absolute paths (not relative)
3. Ensure directory exists
4. Check file/directory permissions

---

## 📊 MCP Server Status Check

Once configured, you can verify MCP servers are active:

**Ask Claude Code:**
```
"What MCP servers are currently connected?"
```

**Expected Response:**
- shadcn-ui ✅
- playwright ✅
- filesystem ✅

---

## 🎯 Recommended Workflows with MCP Servers

### Workflow 1: Implementing a New UI Component

1. **Ask Shadcn MCP:**
   ```
   "Show me how to use the shadcn/ui Alert Dialog component"
   ```

2. **Get component code from Shadcn MCP**

3. **Create file using File System MCP:**
   ```
   "Create a new component at frontend/src/components/ConfirmDialog.tsx"
   ```

4. **Test with Playwright MCP:**
   ```
   "Navigate to http://localhost:5173 and test the new dialog"
   ```

---

### Workflow 2: Testing Arabic UI

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Use Playwright MCP:**
   ```
   "Navigate to http://localhost:5173"
   "Click the language switcher and select Arabic"
   "Take a screenshot to verify RTL layout"
   "Test navigation in Arabic"
   ```

3. **Verify with File System MCP:**
   ```
   "Read the LanguageContext.tsx file and check Arabic translations"
   ```

---

### Workflow 3: Automated E2E Testing

1. **Create test scenarios using Playwright MCP:**
   ```
   "Navigate to http://localhost:5173"
   "Fill in the login form with username: admin, password: Admin@123"
   "Click the login button"
   "Verify the dashboard loads"
   "Take a screenshot of the dashboard"
   ```

2. **Document results using File System MCP:**
   ```
   "Create a test report at tests/e2e-results/arabic-ui-test.md"
   ```

---

## 📚 Additional Resources

### Official Documentation
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Shadcn MCP:** https://github.com/Jpisnice/shadcn-ui-mcp-server
- **Playwright MCP:** https://github.com/microsoft/playwright-mcp
- **File System MCP:** https://github.com/modelcontextprotocol/servers

### Community Resources
- MCP Servers Directory: https://mcpservers.org/
- Awesome MCP Servers: https://github.com/punkpeye/awesome-mcp-servers

---

## 🎓 Best Practices

1. **Start Simple**
   - Test each MCP server individually
   - Use simple commands first
   - Verify connectivity before complex workflows

2. **Security First**
   - Limit file system access to project directory only
   - Use Playwright with localhost only (development)
   - Never add sensitive directories to file system MCP

3. **Efficient Workflows**
   - Use Shadcn MCP for component documentation
   - Use Playwright MCP for testing and validation
   - Use File System MCP for file operations

4. **Error Handling**
   - If MCP command fails, check logs
   - Restart Claude Code if servers become unresponsive
   - Validate JSON configuration syntax

---

## ✅ Configuration Checklist

After completing setup:

- [ ] Created `claude_desktop_config.json` with all 3 MCP servers
- [ ] Verified Node.js and npx are installed
- [ ] Restarted Claude Code
- [ ] Tested Shadcn MCP (list components)
- [ ] Tested Playwright MCP (navigate to URL)
- [ ] Tested File System MCP (read a file)
- [ ] All 3 MCP servers showing as connected
- [ ] Project directory path is correct in filesystem config
- [ ] Security: Only project directory accessible

---

## 🚀 You're Ready!

With these 3 MCP servers configured, Claude Code can now:
- ✅ Access shadcn/ui documentation and examples
- ✅ Automate browser testing with Playwright
- ✅ Perform file operations securely
- ✅ Help implement features end-to-end
- ✅ Test Arabic/RTL UI automatically

**Next Step:** Start using MCP servers in your Week 1 tasks! For example, use Playwright MCP to test the frontend after `npm install`.

---

**Last Updated:** 2025-11-03
**Status:** 📋 READY FOR CONFIGURATION
**Configuration File:** See Step 2 above
