# Newneo Academy / Learning Factory Roadmap

## Purpose
Create reusable technical learning assets linked directly to Newneo engagement phases, internal capability development and customer enablement.

This is a future module of Newneo Platform and should not block v1 CRM / playbook / proposal implementation.

## Strategic role
The learning system serves three audiences:
- Newneo internal teams
- project customers
- customers buying training as a standalone or add-on service

The goal is to convert technical knowledge into reusable company IP.

## Learning paths aligned to delivery
Suggested initial courses:

- AI Infrastructure Foundations
- AI Compute & Runtime Fundamentals
- Enterprise RAG Design
- MCP & Enterprise Actions
- Enterprise Agent Engineering
- AI Security & Governance
- AI Evaluation & Testing
- Production AI Deployment
- Operating AI in Production

## Course factory workflow
`Course Brief → Learning Objectives → Syllabus → Modules → Lessons → Technical Content → Labs / Exercises → Knowledge Checks → Assessment → Instructor Guide → Student Material → Presentation`

The platform should support automation from syllabus and source content, while allowing human review of:
- technical accuracy
- pedagogical sequencing
- diagrams and screenshots
- labs
- presentation visuals

## Proposal integration
Proposal Engine should be able to recommend training packages based on project scope.

Examples:
- RAG implementation → suggest Enterprise RAG Design
- MCP/integration work → suggest MCP & Enterprise Actions
- production agent deployment → suggest Operating AI in Production
- private AI cluster → suggest AI Compute & Runtime Fundamentals

Training packages may be:
- included
- optional add-on
- customer-specific enablement

## Core entities
Future database entities:
- courses
- course_versions
- learning_paths
- course_modules
- lessons
- labs
- knowledge_checks
- assessments
- instructor_guides
- student_materials
- presentations
- customer_training_packages
- enrollments
- completions
- certifications

## Internal capability model
Every new Newneo technical capability should eventually generate reusable assets:
- assessment checklist
- architecture pattern
- delivery playbook
- course
- lab
- customer enablement material

This creates a reinforcing loop between delivery experience and company-wide capability development.

## Product principle
**Build it. Transfer the knowledge. Operate it together.**
