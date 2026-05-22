import os
import json
import re
from bs4 import BeautifulSoup

def clean_text(text):
    if not text:
        return ""
    # Replace multiple spaces/newlines with a single space
    return re.sub(r'\s+', ' ', text).strip()

def parse_react_roadmap(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    title = clean_text(soup.find('h1').text) if soup.find('h1') else "React.js Simple 30-Day Roadmap"
    subtitle = clean_text(soup.find('p').text) if soup.find('p') else ""
    
    roadmap_id = "react-simple"
    
    # React simple doesn't have month tabs, we will put it into a single tab: "30-Day Course"
    tab = {
        "name": "30-Day Course",
        "summary": [
            {"val": "4", "lbl": "Weeks"},
            {"val": "30", "lbl": "Days"},
            {"val": "4", "lbl": "Mini Projects"},
            {"val": "0", "lbl": "Prerequisites"}
        ],
        "phases": []
    }
    
    week_cards = soup.find_all('div', class_='week-card')
    for w_idx, card in enumerate(week_cards):
        header = card.find('div', class_='week-title')
        if not header:
            continue
        
        badge_el = header.find('span', class_='segment-badge')
        badge = clean_text(badge_el.text) if badge_el else "React"
        
        # Extract title text (excluding badge and chevron)
        title_text = ""
        for child in header.children:
            if child.name != 'span' or ('segment-badge' not in child.get('class', []) and 'chevron' not in child.get('class', [])):
                title_text += str(child)
        title_text = clean_text(BeautifulSoup(title_text, 'html.parser').text)
        
        # Meta: e.g. "Week 1"
        meta = f"Week {w_idx + 1}"
        
        body = card.find('div', class_='week-body')
        days = []
        if body:
            day_items = body.find_all('div', class_='day-item')
            for d_idx, item in enumerate(day_items):
                day_num_el = item.find('div', class_='day-num')
                day_label = clean_text(day_num_el.text) if day_num_el else f"Day {d_idx + 1}"
                
                topic_el = item.find('div', class_='day-topic')
                task_title = clean_text(topic_el.text) if topic_el else ""
                
                desc_el = item.find('div', class_='day-desc')
                task_sub = ""
                if desc_el:
                    # Keep code tags as code styled text if needed, or extract text
                    task_sub = clean_text(desc_el.text)
                
                project_box_el = item.find('div', class_='project-box')
                project_box = clean_text(project_box_el.text) if project_box_el else None
                
                days.append({
                    "id": f"{roadmap_id}-w{w_idx}-d{d_idx}",
                    "dayLabel": day_label,
                    "taskTitle": task_title,
                    "taskSub": task_sub,
                    "tag": "Practice" if not project_box else "Project",
                    "projectBox": project_box
                })
        
        tab["phases"].append({
            "id": f"{roadmap_id}-w{w_idx}",
            "badge": badge,
            "badgeClass": "badge-react",
            "title": title_text,
            "meta": meta,
            "sections": [
                {
                    "label": "Daily Tasks",
                    "days": days
                }
            ]
        })
        
    return {
        "id": roadmap_id,
        "title": title,
        "subtitle": subtitle,
        "icon": "react",
        "themeColor": "sky",
        "tabs": [tab]
    }

def parse_tabbed_roadmap(filepath, roadmap_id, icon, themeColor):
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    title_el = soup.find('h1')
    title = clean_text(title_el.text) if title_el else ""
    # Icon cleanup from title
    title = re.sub(r'^[^\w]+', '', title).strip() # remove leading emojis
    
    subtitle_el = soup.find('p')
    subtitle = clean_text(subtitle_el.text) if subtitle_el else ""
    
    tabs = []
    tab_btns = soup.find_all('button', class_=re.compile(r'^(tab-btn|tab)$'))
    
    # Locate month contents
    # There are elements with class month-content or tab-content
    contents = soup.find_all('div', class_=re.compile(r'(month-content|tab-content|phase-panel)'))
    
    for idx, btn in enumerate(tab_btns):
        btn_text = clean_text(btn.text)
        btn_text = re.sub(r'^[^\w]+', '', btn_text).strip() # remove leading emojis
        
        content = contents[idx] if idx < len(contents) else None
        if not content:
            continue
            
        summary_cards = []
        summary_container = content.find('div', class_=re.compile(r'(month-summary|tab-summary|summary)'))
        if summary_container:
            cards = summary_container.find_all('div', class_=re.compile(r'(summary-card|sum-card)'))
            for card in cards:
                num_el = card.find('div', class_='num')
                lbl_el = card.find('div', class_='lbl')
                if num_el and lbl_el:
                    summary_cards.append({
                        "val": clean_text(num_el.text),
                        "lbl": clean_text(lbl_el.text)
                    })
        
        phases = []
        phase_cards = content.find_all('div', class_=re.compile(r'(phase-card|mod-card)'))
        for p_idx, p_card in enumerate(phase_cards):
            header = p_card.find('div', class_=re.compile(r'(phase-header|mod-header)'))
            if not header:
                continue
                
            badge_el = header.find('span', class_=re.compile(r'(phase-badge|mod-pill)'))
            badge = clean_text(badge_el.text) if badge_el else ""
            badge_class = ""
            if badge_el:
                classes = badge_el.get('class', [])
                for c in classes:
                    if c != 'phase-badge' and c != 'mod-pill':
                        badge_class = c
            
            title_el = header.find('span', class_=re.compile(r'(phase-title|mod-title)'))
            phase_title = clean_text(title_el.text) if title_el else ""
            
            meta_el = header.find('span', class_=re.compile(r'(phase-meta|mod-meta)'))
            phase_meta = clean_text(meta_el.text) if meta_el else ""
            
            body = p_card.find('div', class_=re.compile(r'(phase-body|mod-body)'))
            sections = []
            
            if body:
                # Find all week sections or blocks
                sec_items = body.find_all('div', class_=re.compile(r'(week-section|week-block)'))
                if not sec_items:
                    # If no sections, maybe raw day rows
                    day_rows = body.find_all('div', class_='day-row')
                    if day_rows:
                        sec_items = [body] # Treat body as single section
                
                for s_idx, sec in enumerate(sec_items):
                    lbl_el = sec.find('div', class_=re.compile(r'(week-label|week-title)'))
                    sec_label = clean_text(lbl_el.text) if lbl_el else "Section Content"
                    
                    day_rows = sec.find_all('div', class_='day-row')
                    days = []
                    for r_idx, r in enumerate(day_rows):
                        d_lbl_el = r.find('div', class_=re.compile(r'(day-label|day-lbl)'))
                        d_lbl = clean_text(d_lbl_el.text) if d_lbl_el else ""
                        
                        task_el = r.find('div', class_='day-task')
                        task_title = ""
                        task_sub = ""
                        
                        if task_el:
                            # Extract direct text nodes for title
                            sub_el = task_el.find('div', class_=re.compile(r'(sub|day-sub)'))
                            task_sub = clean_text(sub_el.text) if sub_el else ""
                            
                            # Remove sub tag from task_el to extract title text
                            if sub_el:
                                sub_el.decompose()
                            task_title = clean_text(task_el.text)
                        
                        tag_el = r.find('div', class_=re.compile(r'(video-tag|resource-tag|tag)'))
                        tag_val = clean_text(tag_el.text) if tag_el else ""
                        
                        days.append({
                            "id": f"{roadmap_id}-t{idx}-p{p_idx}-s{s_idx}-r{r_idx}",
                            "dayLabel": d_lbl,
                            "taskTitle": task_title,
                            "taskSub": task_sub,
                            "tag": tag_val
                        })
                    
                    note_el = sec.find('div', class_=re.compile(r'(resource-note|tip-box)'))
                    note_val = clean_text(note_el.text) if note_el else None
                    
                    sections.append({
                        "label": sec_label,
                        "days": days,
                        "note": note_val
                    })
                    
            phases.append({
                "id": f"{roadmap_id}-t{idx}-p{p_idx}",
                "badge": badge,
                "badgeClass": badge_class,
                "title": phase_title,
                "meta": phase_meta,
                "sections": sections
            })
            
        # Milestone at bottom of tab
        milestone_el = content.find('div', class_='milestone')
        milestone = clean_text(milestone_el.text) if milestone_el else None
        
        tabs.append({
            "name": btn_text,
            "summary": summary_cards,
            "phases": phases,
            "milestone": milestone
        })
        
    return {
        "id": roadmap_id,
        "title": title,
        "subtitle": subtitle,
        "icon": icon,
        "themeColor": themeColor,
        "tabs": tabs
    }

def main():
    roadmaps = []
    
    # 1. React Simple
    print("Parsing React Simple Roadmap...")
    try:
        roadmaps.append(parse_react_roadmap('react_simple_roadmap.html'))
    except Exception as e:
        print(f"Error parsing react simple: {e}")
        
    # 2. ML 3-Month
    print("Parsing ML 3-Month Roadmap...")
    try:
        roadmaps.append(parse_tabbed_roadmap('ml_3month_roadmap.html', 'ml-3month', 'brain', 'emerald'))
    except Exception as e:
        print(f"Error parsing ML roadmap: {e}")
        
    # 3. Web Dev
    print("Parsing Web Dev Roadmap...")
    try:
        roadmaps.append(parse_tabbed_roadmap('web dev.html', 'web-dev', 'globe', 'indigo'))
    except Exception as e:
        print(f"Error parsing Web Dev roadmap: {e}")
        
    # 4. App Dev
    print("Parsing App Dev Roadmap...")
    try:
        roadmaps.append(parse_tabbed_roadmap('app dev.html', 'app-dev', 'smartphone', 'violet'))
    except Exception as e:
        print(f"Error parsing App Dev roadmap: {e}")
        
    # 5. UI UX
    print("Parsing UI UX Roadmap...")
    try:
        roadmaps.append(parse_tabbed_roadmap('ui ux .html', 'ui-ux', 'palette', 'pink'))
    except Exception as e:
        print(f"Error parsing UI UX roadmap: {e}")
        
    # 6. AI Mastery
    print("Parsing AI Mastery Roadmap...")
    try:
        roadmaps.append(parse_tabbed_roadmap('ai_mastery_roadmap.html', 'ai-mastery', 'sparkles', 'rose'))
    except Exception as e:
        print(f"Error parsing AI Mastery roadmap: {e}")
        
    with open('roadmaps.json', 'w', encoding='utf-8') as f:
        json.dump(roadmaps, f, indent=2, ensure_ascii=False)
    print("Successfully wrote roadmaps.json!")

if __name__ == '__main__':
    main()
