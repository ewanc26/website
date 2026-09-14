/**
 * Interactive terminal CV script generator.
 *
 * Produces a self-contained bash script served at /cv. Content is
 * pre-rendered server-side from AT Protocol records (see data.ts) and
 * injected as heredoc variables; the bash layer handles the menu,
 * /dev/tty interaction, colour stripping, and the terminal chrome.
 *
 * Design language mirrors ewancroft.uk: green accent (rgb(100 187 68)),
 * prompt-style headers, box-drawing rules, monospace throughout.
 */

import type { CvData } from "./data.js";

const WIDTH = 74;

const ANSI = {
  green: "\x1b[38;2;100;187;68m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

/** Wrap plain text at WIDTH, preserving paragraph breaks. */
function wrap(text: string): string {
  const out: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    if (!paragraph.trim()) continue;
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (!line) line = word;
      else if (line.length + word.length + 1 <= WIDTH) line += ` ${word}`;
      else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out.join("\n");
}

/** Section heading with trailing rule, matching the site's section-title style. */
function heading(title: string): string {
  const label = `── ${title.toLowerCase()} `;
  const rule = "─".repeat(Math.max(2, WIDTH - label.length));
  return `${ANSI.green}${ANSI.bold}${label}${ANSI.reset}${ANSI.dim}${rule}${ANSI.reset}`;
}

function keyValue(label: string, value: string): string {
  return `${ANSI.green}${label.padEnd(14)}${ANSI.reset}${value}`;
}

/** Bash-quoted heredoc assignment. Escapes lone single quotes for bash 3.2 compatibility. */
function heredoc(name: string, content: string): string {
  // Escape single quotes as '\'' to avoid bash 3.2 heredoc-in-$() parsing bug
  const escaped = content.replace(/'/g, "'\\''");
  return `SEC_${name}=$(cat <<'EOF'\n${escaped}\nEOF\n)`;
}

function renderSummary(data: CvData): string {
  return [heading("summary"), "", wrap(data.summary)].join("\n");
}

function renderMethodology(data: CvData): string {
  const lines = [heading("methodology & workflow"), ""];
  for (const paragraph of data.methodology) {
    lines.push(wrap(paragraph), "");
  }
  return lines.join("\n").trimEnd();
}

function renderSkills(data: CvData): string {
  const lines = [heading("skills"), ""];
  for (const group of data.skillGroups) {
    lines.push(
      `${ANSI.green}${ANSI.bold}${group.category.toLowerCase()}${ANSI.reset}`,
    );
    lines.push(wrap(group.skills.join(" · ")), "");
  }
  return lines.join("\n").trimEnd();
}

function renderProjects(data: CvData): string {
  const lines = [heading("selected projects & infrastructure"), ""];
  for (const project of data.selectedProjects) {
    lines.push(
      `${ANSI.green}${ANSI.bold}${project.name}${ANSI.reset} — ${project.stack}`,
    );
    lines.push(wrap(project.description), "");
  }
  const other = data.recordProjects.filter(
    (p) => !data.selectedProjects.some((s) => s.name.toLowerCase() === p.name),
  );
  if (other.length) {
    lines.push(`${ANSI.dim}── other projects ──${ANSI.reset}`, "");
    for (const project of other) {
      const period = project.startedAt
        ? ` (${project.startedAt.slice(0, 4)}–${project.endedAt?.slice(0, 4) ?? "present"})`
        : "";
      lines.push(`${ANSI.green}${project.name}${ANSI.reset}${period}`);
      if (project.description) lines.push(wrap(project.description));
      if (project.url) lines.push(`${ANSI.dim}${project.url}${ANSI.reset}`);
      lines.push("");
    }
  }
  return lines.join("\n").trimEnd();
}

function renderExperience(data: CvData): string {
  const lines = [heading("experience"), ""];
  for (const role of data.experience) {
    lines.push(
      `${ANSI.green}${ANSI.bold}${role.title}${ANSI.reset} — ${role.org} · ${role.period}`,
    );
    for (const point of role.points) {
      lines.push(wrap(`- ${point}`));
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function renderEducation(data: CvData): string {
  const lines = [heading("education"), ""];
  for (const entry of data.education) {
    const period =
      entry.startedAt || entry.endedAt
        ? ` · ${entry.startedAt?.slice(0, 7) ?? "?"} – ${entry.endedAt?.slice(0, 7) ?? "present"}`
        : "";
    const grade = entry.grade ? ` — ${entry.grade}` : "";
    lines.push(
      `${ANSI.green}${ANSI.bold}${entry.qualification}${ANSI.reset}${grade}`,
    );
    lines.push(
      `${entry.institution}${entry.field ? ` · ${entry.field}` : ""}${period}`,
    );
    if (entry.description) lines.push(wrap(entry.description));
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function renderLanguages(data: CvData): string {
  const lines = [heading("languages"), ""];
  for (const language of data.languages) {
    lines.push(keyValue(language.name.toLowerCase(), language.proficiency));
  }
  return lines.join("\n");
}

function renderLinks(data: CvData): string {
  const lines = [heading("links"), ""];
  for (const link of data.links) {
    lines.push(`${ANSI.green}${link.label.padEnd(18)}${ANSI.reset}${link.url}`);
  }
  return lines.join("\n");
}

function renderHeader(data: CvData): string {
  const lines = [
    `${ANSI.green}${ANSI.bold}${data.name.toUpperCase()}${ANSI.reset}`,
    `${ANSI.dim}${data.headline}${ANSI.reset}`,
  ];
  if (data.location) lines.push(`${ANSI.dim}${data.location}${ANSI.reset}`);
  lines.push(
    `${ANSI.dim}generated ${data.generatedAt} from AT Protocol records — ewancroft.uk/cv${ANSI.reset}`,
  );
  return lines.join("\n");
}

const BASH_TEMPLATE = `#!/usr/bin/env bash
# Ewan Croft — interactive terminal CV
# served from https://ewancroft.uk/cv
# data aggregated from AT Protocol records — same source as ewancroft.uk/about
set -u

__SECTIONS__

strip_ansi() { sed $'s/\\033\\[[0-9;]*m//g'; }

print_section() {
  case "$1" in
    summary)     printf '%s\\n' "$SEC_SUMMARY" ;;
    methodology) printf '%s\\n' "$SEC_METHODOLOGY" ;;
    skills)      printf '%s\\n' "$SEC_SKILLS" ;;
    projects)    printf '%s\\n' "$SEC_PROJECTS" ;;
    experience)  printf '%s\\n' "$SEC_EXPERIENCE" ;;
    education)   printf '%s\\n' "$SEC_EDUCATION" ;;
    languages)   printf '%s\\n' "$SEC_LANGUAGES" ;;
    links)       printf '%s\\n' "$SEC_LINKS" ;;
    *) return 1 ;;
  esac
}

ALL_SECTIONS="summary methodology skills projects experience education languages links"

# Direct section argument: print and exit.
if [ $# -gt 0 ]; then
  if [ "$1" = "all" ]; then
    for s in $ALL_SECTIONS; do print_section "$s"; printf '\\n'; done
  elif print_section "$1"; then :
  else
    printf 'unknown section: %s\\ntry: %s\\n' "$1" "$ALL_SECTIONS" >&2
    exit 1
  fi
  exit 0
fi

# No tty (curl | bash over a pipe, or redirected output): dump everything.
if ! [ -t 1 ] || ! [ -e /dev/tty ]; then
  for s in $ALL_SECTIONS; do print_section "$s"; printf '\\n'; done | strip_ansi
  exit 0
fi

GREEN=$'\\033[38;2;100;187;68m'
BOLD=$'\\033[1m'
DIM=$'\\033[2m'
RESET=$'\\033[0m'

menu() {
  printf '\\n'
  printf '%s\\n' "$GREEN$BOLD  ewan@ewancroft.uk:~\\$ cv$RESET"
  printf '%s\\n' "$DIM  ─────────────────────────────────────────────$RESET"
  printf '  %s1%s summary        %s5%s experience\\n' "$GREEN" "$RESET" "$GREEN" "$RESET"
  printf '  %s2%s methodology    %s6%s education\\n'   "$GREEN" "$RESET" "$GREEN" "$RESET"
  printf '  %s3%s skills         %s7%s languages\\n'   "$GREEN" "$RESET" "$GREEN" "$RESET"
  printf '  %s4%s projects       %s8%s links\\n'       "$GREEN" "$RESET" "$GREEN" "$RESET"
  printf '\\n'
  printf '  %sa%s all            %sq%s quit\\n' "$GREEN" "$RESET" "$GREEN" "$RESET"
  printf '  %s' "$GREEN"
}

printf '%s\\n' "$SEC_HEADER"
menu
while IFS= read -r choice < /dev/tty; do
  case "$choice" in
    1|summary)     print_section summary ;;
    2|methodology) print_section methodology ;;
    3|skills)      print_section skills ;;
    4|projects)    print_section projects ;;
    5|experience)  print_section experience ;;
    6|education)   print_section education ;;
    7|languages)   print_section languages ;;
    8|links)       print_section links ;;
    a|all)
      for s in $ALL_SECTIONS; do print_section "$s"; printf '\\n'; done
      ;;
    q|quit)
      printf '%s\\n' "$DIM  oidhche mhath$RESET"
      exit 0
      ;;
    *)
      printf '%s\\n' "$DIM  unknown option: $choice$RESET"
      ;;
  esac
  menu
done
`;

/** Build the complete interactive bash CV script. */
export function generateCvScript(data: CvData): string {
  const sections = [
    heredoc("HEADER", renderHeader(data)),
    heredoc("SUMMARY", renderSummary(data)),
    heredoc("METHODOLOGY", renderMethodology(data)),
    heredoc("SKILLS", renderSkills(data)),
    heredoc("PROJECTS", renderProjects(data)),
    heredoc("EXPERIENCE", renderExperience(data)),
    heredoc("EDUCATION", renderEducation(data)),
    heredoc("LANGUAGES", renderLanguages(data)),
    heredoc("LINKS", renderLinks(data)),
  ].join("\n\n");

  return BASH_TEMPLATE.replace("__SECTIONS__", sections);
}
