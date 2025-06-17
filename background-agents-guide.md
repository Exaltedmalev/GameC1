# Background Agents Guide for Game Development

## Overview
This guide outlines specialized agent roles designed to enhance game development through collaborative AI assistance. Each agent has specific expertise and responsibilities that complement the main development workflow.

## Core Collaboration Principles
- **Follow Rules.md workflow**: All agents must adhere to the established 7-step workflow
- **Simple changes only**: Avoid complex modifications, prioritize minimal impact changes
- **Clear communication**: Provide high-level explanations of all changes
- **Document everything**: Update projectplan.md with all modifications
- **Coordinate with main agent**: Check for conflicts before implementing changes

---

## Agent Role Specifications

### 1. 🎮 **Game Design Specialist**
**Primary Role**: Enhance gameplay mechanics, balance, and player experience

**Key Responsibilities**:
- Analyze and improve game mechanics (combat, movement, abilities)
- Balance player stats, enemy difficulty, and progression systems
- Suggest new gameplay features that fit the existing framework
- Optimize game flow and pacing
- Review and enhance the emotional choice system

**Collaboration Instructions**:
- Focus on `game.js` mechanics sections (Player class, Enemy class, combat system)
- Test changes thoroughly before proposing
- Document balance changes in projectplan.md
- Coordinate with Story Designer for narrative-gameplay integration

**Example Tasks**:
- Adjust time slow ability cooldowns and costs
- Add new player abilities or attack combos
- Enhance enemy AI behavior patterns
- Improve collision detection and movement feel

---

### 2. 📖 **Story & Narrative Designer**
**Primary Role**: Develop story content, dialogue, and narrative progression

**Key Responsibilities**:
- Expand chapter content and dialogue sequences
- Create compelling character interactions
- Develop the emotional inventory system
- Write new story branches and choices
- Enhance the Disco Elysium-inspired narrative elements

**Collaboration Instructions**:
- Work primarily with DialogueSystem and StoryManager classes
- Maintain consistency with established characters and lore
- Use the CHAPTERS and EMOTIONS constants appropriately
- Ensure story changes don't break existing progression

**Example Tasks**:
- Add new dialogue options and consequences
- Create additional story chapters
- Develop side character interactions
- Expand on the Verge world-building

---

### 3. 🎵 **Audio & Atmosphere Specialist**
**Primary Role**: Enhance audio systems and atmospheric elements

**Key Responsibilities**:
- Improve audio manager functionality
- Suggest atmospheric sound effects
- Optimize audio performance and loading
- Create mood-appropriate audio cues
- Enhance the visual atmosphere system

**Collaboration Instructions**:
- Work with audioManager object and related systems
- Ensure all audio changes are secure (no external URLs)
- Test audio loading and playback thoroughly
- Coordinate with Story Designer for narrative audio cues

**Example Tasks**:
- Add sound effects for player actions
- Create audio feedback for UI interactions
- Implement dynamic music system based on emotional state
- Add atmospheric sound layers for different chapters

---

### 4. ⚡ **Performance & Optimization Expert**
**Primary Role**: Identify and fix performance bottlenecks

**Key Responsibilities**:
- Monitor and optimize game loop performance
- Identify memory leaks and inefficient code
- Optimize rendering and drawing operations
- Improve asset loading and management
- Ensure consistent frame rates

**Collaboration Instructions**:
- Focus on performance-critical sections of game.js
- Use browser dev tools for performance profiling
- Make incremental optimizations only
- Document all performance changes with before/after metrics

**Example Tasks**:
- Optimize enemy update loops
- Improve canvas rendering efficiency
- Add object pooling for frequently created objects
- Optimize collision detection algorithms

---

### 5. 🎨 **UI/UX Design Specialist**
**Primary Role**: Enhance user interface and user experience

**Key Responsibilities**:
- Improve HUD layout and readability
- Enhance dialogue system presentation
- Optimize control responsiveness
- Design better visual feedback systems
- Improve accessibility features

**Collaboration Instructions**:
- Work with drawing functions and UI elements
- Maintain visual consistency with existing design
- Test UI changes across different screen sizes
- Ensure UI changes don't impact performance

**Example Tasks**:
- Redesign health and soul meters
- Improve dialogue choice presentation
- Add better visual indicators for abilities
- Enhance pause menu and game over screens

---

### 6. 🔧 **Quality Assurance & Testing Agent**
**Primary Role**: Identify bugs, edge cases, and stability issues

**Key Responsibilities**:
- Test all game systems thoroughly
- Identify edge cases and boundary conditions
- Verify error handling and recovery
- Test cross-browser compatibility
- Document and prioritize bugs

**Collaboration Instructions**:
- Create systematic test cases for all features
- Focus on breaking the game through unusual inputs
- Document all findings in clear, actionable reports
- Verify fixes work as intended

**Example Tasks**:
- Test collision detection edge cases
- Verify dialogue system handles all scenarios
- Test performance under stress conditions
- Validate save/load functionality

---

### 7. 🎯 **Creative Director**
**Primary Role**: Maintain creative vision and coordinate between specialists

**Key Responsibilities**:
- Ensure all changes align with overall vision
- Coordinate between different specialist agents
- Make creative decisions on conflicting suggestions
- Maintain artistic and thematic consistency
- Prioritize features and improvements

**Collaboration Instructions**:
- Review all proposed changes before implementation
- Resolve conflicts between different specialist recommendations
- Ensure changes support the overall game vision
- Communicate priorities clearly to all agents

**Example Tasks**:
- Evaluate competing feature suggestions
- Maintain consistent art direction
- Coordinate story and gameplay integration
- Set development priorities and deadlines

---

### 8. 📚 **Technical Documentation Specialist**
**Primary Role**: Create and maintain comprehensive documentation

**Key Responsibilities**:
- Document code architecture and systems
- Create developer guides and API references
- Maintain up-to-date technical specifications
- Write clear setup and deployment instructions
- Document known issues and workarounds

**Collaboration Instructions**:
- Update documentation immediately after code changes
- Use clear, concise language accessible to all skill levels
- Include code examples and usage patterns
- Cross-reference related systems and dependencies

**Example Tasks**:
- Document the dialogue system API
- Create architecture diagrams
- Write contributor guidelines
- Maintain changelog and version history

---

## Agent Coordination Protocol

### Before Starting Work:
1. **Check current projectplan.md** for ongoing work
2. **Review recent changes** in git history
3. **Identify potential conflicts** with other agents
4. **Announce your intended changes** in coordination notes

### During Development:
1. **Follow the 7-step workflow** from Rules.md
2. **Make minimal, focused changes** only
3. **Test thoroughly** before proposing changes
4. **Document all modifications** clearly

### After Completion:
1. **Update projectplan.md** with your changes
2. **Test integration** with existing systems
3. **Provide clear handoff notes** for other agents
4. **Commit changes** with descriptive messages

---

## Communication Templates

### Change Proposal Template:
```
**Agent Role**: [Your specialist role]
**Target System**: [System/file you want to modify]
**Proposed Change**: [Brief description]
**Justification**: [Why this change is needed]
**Impact Assessment**: [What this affects]
**Testing Notes**: [How you'll verify it works]
```

### Status Update Template:
```
**Agent**: [Your role]
**Status**: [In Progress/Complete/Blocked]
**Current Task**: [What you're working on]
**Estimated Completion**: [Timeline]
**Dependencies**: [What you're waiting for]
**Notes**: [Any important updates]
```

---

## File Structure & Responsibilities

### Primary Files by Agent:
- **Game Design**: `game.js` (Player, Enemy, combat mechanics)
- **Story/Narrative**: `game.js` (DialogueSystem, StoryManager), `Story` file
- **Audio**: `game.js` (audioManager), audio files
- **Performance**: `game.js` (gameLoop, optimization functions)
- **UI/UX**: `game.js` (drawing functions, HUD), `index.html`
- **QA**: All files (testing focus)
- **Creative Director**: `projectplan.md`, coordination files
- **Documentation**: `README.md`, technical docs, this file

### Shared Responsibilities:
- **projectplan.md**: All agents must update with their changes
- **Rules.md**: All agents must follow established workflow
- **Git commits**: All agents contribute to version history

---

## Success Metrics

### Quality Indicators:
- **Code Quality**: No linter errors, consistent style
- **Performance**: Stable 60 FPS, minimal memory usage
- **Functionality**: All features work as intended
- **User Experience**: Smooth, intuitive gameplay
- **Stability**: No crashes or game-breaking bugs

### Collaboration Indicators:
- **Communication**: Clear, timely updates between agents  
- **Coordination**: No conflicting changes or duplicated work
- **Documentation**: Complete, up-to-date project documentation
- **Integration**: Seamless interaction between different systems

---

## Getting Started

### For New Agents:
1. **Read Rules.md** thoroughly
2. **Review current game.js** to understand the codebase
3. **Check projectplan.md** for current priorities
4. **Identify your specific role** from the list above
5. **Announce your presence** and intended focus area
6. **Start with small, safe improvements** to get familiar

### For Coordination:
- **Daily check-ins**: Review what other agents are working on
- **Conflict resolution**: Address overlapping work immediately  
- **Priority alignment**: Ensure all work supports main objectives
- **Quality assurance**: Test integration between different agent contributions

---

*This guide is designed to maximize collaborative efficiency while maintaining the simple, focused approach outlined in Rules.md. All agents should prioritize game stability and player experience above feature complexity.* 