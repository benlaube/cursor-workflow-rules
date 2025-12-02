#!/usr/bin/env python3
"""
Type generation script for supabase-core-python.

This script generates Python type definitions from Supabase database schema.
Uses Supabase CLI to generate types and converts them to Python format.

Usage:
    python scripts/generate-types.py
    
    # Or with custom output path
    python scripts/generate-types.py --output types/database_types.py
    
    # Or with custom Supabase project
    python scripts/generate-types.py --project-ref your-project-ref
"""

import argparse
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """
    Run a shell command and return the result.
    
    Args:
        cmd: Command to run as list
        check: Whether to raise exception on error
        
    Returns:
        CompletedProcess result
    """
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=check,
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(cmd)}", file=sys.stderr)
        print(f"Error: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("Error: Supabase CLI not found. Install it first:", file=sys.stderr)
        print("  npm install -g supabase", file=sys.stderr)
        sys.exit(1)


def check_supabase_cli() -> bool:
    """Check if Supabase CLI is installed."""
    result = run_command(["supabase", "--version"], check=False)
    return result.returncode == 0


def generate_types_from_cli(project_ref: str | None = None) -> str:
    """
    Generate types using Supabase CLI.
    
    Args:
        project_ref: Optional Supabase project reference
        
    Returns:
        Generated TypeScript types as string
    """
    cmd = ["supabase", "gen", "types", "typescript", "--local"]
    
    if project_ref:
        cmd = ["supabase", "gen", "types", "typescript", "--project-id", project_ref]
    
    result = run_command(cmd)
    return result.stdout


def convert_typescript_to_python(ts_types: str) -> str:
    """
    Convert TypeScript types to Python type hints.
    
    This is a basic converter. For production use, consider using
    a more sophisticated tool or manual conversion.
    
    Args:
        ts_types: TypeScript type definitions
        
    Returns:
        Python type definitions
    """
    # Basic conversion (this is simplified - real conversion would be more complex)
    python_code = '''"""
Auto-generated database types.

This file is auto-generated. Do not edit manually.
Run `python scripts/generate-types.py` to regenerate.
"""

from typing import TypedDict, Optional, Any
from datetime import datetime


# TODO: Convert TypeScript types to Python TypedDict
# This is a placeholder. You should:
# 1. Use Supabase CLI to generate TypeScript types
# 2. Convert them to Python TypedDict manually or with a tool
# 3. Update this file

# Example structure:
# class ProfilesRow(TypedDict):
#     id: str
#     email: str
#     created_at: datetime
#     updated_at: datetime

'''
    
    # Add note about TypeScript types
    python_code += f"\n# Original TypeScript types:\n"
    python_code += f'# """\n'
    for line in ts_types.split('\n'):
        python_code += f'# {line}\n'
    python_code += f'# """\n'
    
    return python_code


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description="Generate Python types from Supabase database schema"
    )
    parser.add_argument(
        "--output",
        "-o",
        default="types/database_types.py",
        help="Output file path (default: types/database_types.py)",
    )
    parser.add_argument(
        "--project-ref",
        "-p",
        help="Supabase project reference (for remote generation)",
    )
    parser.add_argument(
        "--local",
        action="store_true",
        default=True,
        help="Generate types from local Supabase instance (default)",
    )
    
    args = parser.parse_args()
    
    # Check if Supabase CLI is installed
    if not check_supabase_cli():
        print("Error: Supabase CLI not found.", file=sys.stderr)
        print("Install it with: npm install -g supabase", file=sys.stderr)
        sys.exit(1)
    
    print("Generating types from Supabase...")
    
    # Generate TypeScript types
    project_ref = args.project_ref if not args.local else None
    ts_types = generate_types_from_cli(project_ref)
    
    # Convert to Python (basic conversion)
    python_code = convert_typescript_to_python(ts_types)
    
    # Write to file
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w") as f:
        f.write(python_code)
    
    print(f"Types generated successfully: {output_path}")
    print("\nNote: This is a basic conversion. You may need to:")
    print("  1. Manually convert TypeScript types to Python TypedDict")
    print("  2. Use a more sophisticated conversion tool")
    print("  3. Review and update the generated types")


if __name__ == "__main__":
    main()

