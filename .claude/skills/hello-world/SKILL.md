---
name: hello-world
description: A simple hello world skill that demonstrates basic agent skill functionality
---

# Hello World Skill

This is a simple "Hello World" agent skill that demonstrates the basic structure of a Claude Code skill.

## Purpose

When invoked, this skill should:
1. Greet the user with a friendly "Hello World" message
2. Explain that this is a demonstration of agent skills
3. Provide a brief overview of what agent skills can do

## Instructions

When this skill is activated:

1. Display a warm greeting: "Hello World! 👋"
2. Explain: "This is a simple demonstration of Claude Code Agent Skills."
3. Describe the key benefits of agent skills:
   - **Reusable**: Skills can be invoked across different projects
   - **Project-specific**: Skills in `.claude/skills/` are shared with your team
   - **Model-invoked**: Claude automatically uses skills when relevant to the task
   - **Extensible**: Skills can include scripts, templates, and other resources

4. Encourage the user to explore creating more complex skills for their workflows

## Example Usage

When a user asks to "test the hello world skill" or "show me how agent skills work", invoke this skill to provide a friendly introduction to the agent skills system.

## Next Steps

Suggest that users can:
- Create custom skills for their specific workflows
- Add scripts and resources to skills for more complex automation
- Share project skills with their team via git
- Store personal skills in `~/.claude/skills/` for use across all projects
