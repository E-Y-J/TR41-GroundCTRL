#!/usr/bin/env python3
"""
Remove unused variables from Python and JavaScript/JSX files in the workspace.
"""

import os
import ast
import re
from pathlib import Path
from typing import Set, Dict, List, Tuple


class UnusedVariableDetector(ast.NodeVisitor):
    """Detects unused variables in Python code using AST."""

    def __init__(self):
        self.defined_vars: Dict[str, List[int]] = {}  # variable -> line numbers
        self.used_vars: Set[str] = set()
        self.current_scope_vars: Dict[str, int] = {}  # var -> line defined
        self.function_params: Set[str] = set()

    def visit_FunctionDef(self, node):
        """Track function parameters."""
        for arg in node.args.args:
            self.function_params.add(arg.arg)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        """Track async function parameters."""
        for arg in node.args.args:
            self.function_params.add(arg.arg)
        self.generic_visit(node)

    def visit_Assign(self, node):
        """Track variable assignments."""
        for target in node.targets:
            if isinstance(target, ast.Name):
                if target.id not in self.defined_vars:
                    self.defined_vars[target.id] = []
                self.defined_vars[target.id].append(node.lineno)
        self.generic_visit(node)

    def visit_Name(self, node):
        """Track variable usage."""
        if isinstance(node.ctx, (ast.Load, ast.AugLoad)):
            self.used_vars.add(node.id)
        self.generic_visit(node)

    def get_unused_variables(self) -> Set[str]:
        """Returns set of unused variable names."""
        unused = set()
        for var in self.defined_vars:
            if var not in self.used_vars and var not in self.function_params:
                # Skip magic/private variables and common exceptions
                if not var.startswith('_'):
                    unused.add(var)
        return unused


def process_python_file(filepath: str) -> Tuple[int, int]:
    """
    Process a Python file to remove unused variables.
    Returns (removed_count, errors_count)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse the file
        try:
            tree = ast.parse(content)
        except SyntaxError:
            print(f"  ⚠ Syntax error in {filepath}, skipping")
            return 0, 1

        # Detect unused variables
        detector = UnusedVariableDetector()
        detector.visit(tree)
        unused_vars = detector.get_unused_variables()

        if not unused_vars:
            return 0, 0

        # Remove unused variables from content using regex
        modified_content = content
        removed_count = 0

        for var in unused_vars:
            # Match assignment patterns like: var_name = value
            pattern = rf'^\s*{re.escape(var)}\s*=\s*.*$'
            matches = re.findall(pattern, modified_content, re.MULTILINE)
            if matches:
                modified_content = re.sub(pattern + r'\n?', '', modified_content, flags=re.MULTILINE)
                removed_count += len(matches)

        # Write back if changes were made
        if removed_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"  ✓ Removed {removed_count} unused variables from {filepath}")
            return removed_count, 0

        return 0, 0

    except Exception as e:
        print(f"  ✗ Error processing {filepath}: {e}")
        return 0, 1


def process_javascript_file(filepath: str) -> Tuple[int, int]:
    """
    Process JavaScript/JSX file to remove unused variables (basic detection).
    Returns (removed_count, errors_count)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content = content
        removed_count = 0

        # Pattern: const/let/var name = value; where name is not used
        # This is a simplified approach - won't catch all cases
        var_pattern = r'^(\s*)(const|let|var)\s+(\w+)\s*=\s*[^;]+;'
        
        matches = re.finditer(var_pattern, modified_content, re.MULTILINE)
        for match in list(matches):
            var_name = match.group(3)
            # Check if variable is used elsewhere in the file
            # Look for usage outside the declaration line
            usage_pattern = rf'\b{re.escape(var_name)}\b'
            usage_count = len(re.findall(usage_pattern, modified_content))
            
            # If only declared once (the declaration itself), it's unused
            if usage_count == 1:
                modified_content = re.sub(
                    re.escape(match.group(0)) + r'\n?',
                    '',
                    modified_content,
                    count=1
                )
                removed_count += 1

        # Write back if changes were made
        if removed_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"  ✓ Removed {removed_count} unused variables from {filepath}")
            return removed_count, 0

        return 0, 0

    except Exception as e:
        print(f"  ✗ Error processing {filepath}: {e}")
        return 0, 1


def main():
    """Main entry point."""
    workspace_root = Path(__file__).parent.parent
    
    print(f"Scanning workspace: {workspace_root}")
    print("=" * 60)

    total_removed = 0
    total_errors = 0
    py_count = 0
    js_count = 0

    # Process Python files
    print("\n📝 Processing Python files...")
    for py_file in workspace_root.rglob("*.py"):
        # Skip common directories
        if any(skip in py_file.parts for skip in ['node_modules', '.venv', 'venv', '__pycache__']):
            continue

        removed, errors = process_python_file(str(py_file))
        total_removed += removed
        total_errors += errors
        if removed > 0 or errors > 0:
            py_count += 1

    # Process JavaScript/JSX files (optional - basic detection only)
    print("\n📝 Processing JavaScript/JSX files (basic detection)...")
    for js_file in workspace_root.rglob("*.[jt]s[x]?"):
        # Skip common directories
        if any(skip in js_file.parts for skip in ['node_modules', '.next', 'dist', 'build']):
            continue

        # Only .js, .jsx, .ts, .tsx
        if js_file.suffix in ['.js', '.jsx', '.ts', '.tsx']:
            removed, errors = process_javascript_file(str(js_file))
            total_removed += removed
            total_errors += errors
            if removed > 0 or errors > 0:
                js_count += 1

    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary:")
    print(f"  Python files processed: {py_count}")
    print(f"  JavaScript files processed: {js_count}")
    print(f"  Total unused variables removed: {total_removed}")
    print(f"  Total errors encountered: {total_errors}")
    print("=" * 60)

    if total_errors == 0:
        print("✅ Cleanup completed successfully!")
    else:
        print(f"⚠ Cleanup completed with {total_errors} error(s)")


if __name__ == "__main__":
    main()
