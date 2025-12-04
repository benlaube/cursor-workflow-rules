# mcp

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Use an MCP server configuration from ~/.cursor/mcp.json. Configure and utilize Model Context Protocol servers for enhanced functionality.
- **Type:** Executable Command
- **Audience:** AI agents configuring MCP servers
- **Applicability:** When setting up or using MCP server configurations
- **How to Use:** Run this command to use an MCP server configuration from ~/.cursor/mcp.json
- **Dependencies:** None
- **Related Cursor Commands:** None
- **Related Cursor Rules:** None
- **Related Standards:** None

---

## Purpose

Use an MCP server configuration from `~/.cursor/mcp.json`. Configure and utilize Model Context Protocol servers for enhanced functionality.

---

## When to Use

- When setting up MCP server configurations
- When using MCP servers for enhanced functionality
- When configuring Model Context Protocol integration

---

## Prerequisites

- [ ] MCP configuration file exists at `~/.cursor/mcp.json`
- [ ] MCP servers are properly configured
- [ ] Required MCP server dependencies are installed

---

## Steps

### Step 1: Locate MCP Configuration

1. **Check Configuration File:**
   - Verify `~/.cursor/mcp.json` exists
   - Read configuration file
   - Parse JSON structure

2. **Validate Configuration:**
   - Check JSON syntax is valid
   - Verify required fields are present
   - Check server configurations

### Step 2: Review Available MCP Servers

1. **List Configured Servers:**
   - Identify all MCP servers in configuration
   - Note server types and purposes
   - Check server status

2. **Verify Server Access:**
   - Test connection to each server
   - Verify server functionality
   - Note any connection issues

### Step 3: Use MCP Servers

1. **Select Appropriate Server:**
   - Choose server based on task requirements
   - Verify server capabilities match needs

2. **Execute Server Operations:**
   - Use MCP server tools as needed
   - Follow server-specific protocols
   - Handle server responses appropriately

### Step 4: Document Usage

1. **Note Server Usage:**
   - Document which servers were used
   - Note any issues encountered
   - Record successful operations

---

## Expected Output

### Success Case
```
✅ MCP servers configured and ready.

Available Servers:
- Supabase MCP: Connected
- Notion MCP: Connected
- Filesystem MCP: Connected

Ready to use MCP functionality.
```

### Failure Case
```
❌ MCP configuration issue.

Issues:
- MCP configuration file not found at ~/.cursor/mcp.json
- Invalid JSON syntax
- Server connection failed
```

---

## Validation

After using MCP configuration:

- [ ] Configuration file located and parsed
- [ ] MCP servers accessible
- [ ] Server operations successful
- [ ] Any issues documented

---

## Related Files

- **Commands:**
  - None
- **Rules:**
  - None
- **Standards:**
  - None