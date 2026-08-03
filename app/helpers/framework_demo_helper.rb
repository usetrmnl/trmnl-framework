# rubocop:disable Metrics/ModuleLength
module FrameworkDemoHelper
  # ===== Table Overflow Demo Helpers =====
  def framework_table_overflow_rows
    [
      ['1', 'Dwight Schrute', 'Assistant to the Regional Manager', '24', '44', '12.91', 'Owns a beet farm'],
      ['2', 'Jim Halpert', 'Sales Rep', '42', '21', '8.69', 'Dwight hates him'],
      ['3', 'Stanley Hudson', 'Sales Rep', '0', '28', '5.83', 'Only smiles on Pretzel Day'],
      ['4', 'Phyllis Vance', 'Sales Rep', '0', '18', '3.79', 'Married to Bob Vance'],
      ['5', 'Andy Bernard', 'Sales Rep', '2', '14', '3.18', 'Cornell graduate'],
      ['6', 'Creed Bratton', 'Quality Assurance', '???', '???', '???', '???'],
      ['7', 'Karen Filippelli', 'Sales / Utica Manager', '0', '12', '2.57', 'Jim’s ex from Stamford'],
      ['8', 'Michael Scott', 'Regional Manager', '15', '0', '1.65', 'World’s Best Boss mug'],
      ['9', 'Todd Packer', 'Traveling Salesman', '0', '6', '1.34', 'Terrible human being'],
      ['10', 'Ryan Howard', 'Temp / VP / Janitor', '1', '2', '0.63', 'Pitched the Sabre Pyramid'],
      ['11', 'Pam Beesly', 'Receptionist / Office Admin', '3', '0', '0.43', 'Art school dreamer'],
      ['12', 'Meredith Palmer', 'Supplier Relations', '0', '1', '0.32', 'Exchanged paper for steak'],
      ['13', 'Holly Flax', 'HR (Nashua)', '2', '0', '0.32', 'Michael’s soulmate'],
      ['14', 'Darryl Philbin', 'Warehouse Foreman', '1', '0', '0.22', 'Started a band'],
      ['15', 'Kevin Malone', 'Accountant', '1', '0', '0.22', 'Spilled the chili'],
      ['16', 'Erin Hannon', 'Receptionist', '1', '0', '0.22', 'Dates Gabe, then Andy'],
      ['17', 'Kelly Kapoor', 'Customer Service', '0', '0', '0.00', 'Obsessed with Ryan'],
      ['18', 'Angela Martin', 'Accountant', '0', '0', '0.00', 'Owns 12 cats'],
      ['19', 'Oscar Martinez', 'Accountant', '0', '0', '0.00', '“Actually...” guy'],
      ['20', 'Roy Anderson', 'Warehouse', '0', '0', '0.00', 'Pam’s ex-fiancé'],
      ['21', 'Toby Flenderson', 'HR', '0', '0', '0.00', 'Michael hates him'],
      ['22', 'Jan Levinson', 'Corporate', '0', '0', '0.00', 'Serenity by Jan'],
      ['23', 'David Wallace', 'CFO', '0', '0', '0.00', 'Invented “Suck It”'],
      ['24', 'Robert California', 'CEO', '0', '0', '0.00', 'The Lizard King'],
      ['25', 'Nellie Bertram', 'Special Projects Manager', '0', '0', '0.00', 'Took Andy’s job'],
      ['26', 'Deangelo Vickers', 'Regional Manager', '0', '0', '0.00', 'Juggled invisible balls'],
      ['27', 'Charles Miner', 'Corporate VP', '0', '0', '0.00', 'Hated Jim’s pranks'],
      ['28', 'Gabe Lewis', 'Sabre Liaison', '0', '0', '0.00', 'Tall, awkward, hates horror movies'],
      ['29', 'Clark Green', 'Sales', '0', '0', '0.00', 'Mini Dwight'],
      ['30', 'Pete Miller', 'Sales', '0', '0', '0.00', 'Nickname: Plop']
    ]
  end

  def render_framework_table_overflow_table(condensed: false, size: nil, attrs: {}, clamp_lines: nil, include_index: true)
    # Backward compatible API: `condensed: true` still works and maps to small heights
    table_classes = ['table']
    normalized_size = size&.to_s
    case normalized_size
    when 'large'
      table_classes << 'table--large'
    when 'small'
      table_classes << 'table--small'
    when 'xsmall'
      table_classes << 'table--xsmall'
    end
    table_classes << 'table--condensed' if condensed
    attr_html = attrs.transform_keys(&:to_s)

    content_tag(:table, class: table_classes.join(' '), **attr_html) do
      thead = content_tag(:thead) do
        content_tag(:tr) do
          header_title_class = 'title title--small text--gray-45'

          headers = []
          headers << content_tag(:th, content_tag(:span, '', class: header_title_class)) if include_index
          headers += [
            content_tag(:th, content_tag(:span, 'Employee', class: header_title_class)),
            content_tag(:th, content_tag(:span, 'Role', class: header_title_class)),
            content_tag(:th, content_tag(:span, 'Pranks', class: header_title_class)),
            content_tag(:th, content_tag(:span, 'Sales', class: header_title_class)),
            content_tag(:th, content_tag(:span, 'Score', class: header_title_class)),
            content_tag(:th, content_tag(:span, 'Fun Fact', class: header_title_class))
          ]
          safe_join(headers)
        end
      end

      tbody = content_tag(:tbody) do
        safe_join(
          framework_table_overflow_rows.map do |row|
            content_tag(:tr) do
              cells = include_index ? row : row.drop(1)
              safe_join(cells.map.with_index do |cell, j|
                is_employee_column = include_index ? (j == 1) : j.zero?
                cls = if is_employee_column
                        normalized_size == 'xsmall' ? 'label label--small' : 'label'
                      else
                        'label label--small'
                      end
                span_attrs = clamp_lines.to_i.positive? ? { 'data-clamp': clamp_lines.to_i.to_s } : {}
                content_tag(:td) { content_tag(:span, cell, { class: cls }.merge(span_attrs)) }
              end)
            end
          end
        )
      end

      thead.concat(tbody)
    end
  end

  # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def framework_table_overflow_demo_code(condensed: false, size: nil, clamp_lines: nil, include_index: true, overflow_counter: nil)
    normalized_size = size&.to_s
    size_class = case normalized_size
                 when 'large' then ' table--large'
                 when 'small' then ' table--small'
                 when 'xsmall' then ' table--xsmall'
                 else ''
                 end
    base_class = "table#{size_class}#{' table--condensed' if condensed}"
    clamp_attr = clamp_lines.to_i.positive? ? " data-clamp=\"#{clamp_lines.to_i}\"" : ''
    counter_attr = overflow_counter == false ? ' table-overflow-counter="false"' : ''
    index_th = if include_index
                 "            <th><span class=\"title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}\"></span></th>\n"
               else
                 ''
               end
    <<~HTML.strip
            <table class="#{base_class}" data-table-limit="true"#{counter_attr}>
              <thead>
                <tr>
      #{index_th}            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Employee</span></th>
                  <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Role</span></th>
                  <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Pranks</span></th>
                  <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Sales</span></th>
                  <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Score</span></th>
                  <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Fun Fact</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="label label--small"#{clamp_attr}>Row 1, Cell 1</span></td>
                  <td><span class="label#{' label--small' if normalized_size == 'xsmall'}"#{clamp_attr}>Row 1, Cell 2</span></td>
                  <td><span class="label label--small"#{clamp_attr}>Row 1, Cell 3</span></td>
                </tr>
              </tbody>
            </table>
    HTML
  end
  # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

  # Demo code for size variants without overflow attributes
  # rubocop:disable Metrics/CyclomaticComplexity
  def framework_table_demo_code(size: nil, condensed: false)
    normalized_size = size&.to_s
    size_class = case normalized_size
                 when 'large' then ' table--large'
                 when 'small' then ' table--small'
                 when 'xsmall' then ' table--xsmall'
                 else ''
                 end
    base_class = "table#{size_class}#{' table--condensed' if condensed}"
    <<~HTML.strip
      <table class="#{base_class}">
        <thead>
          <tr>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}"></span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Employee</span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Role</span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Pranks</span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Sales</span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Score</span></th>
            <th><span class="title#{' title--small' if condensed || %w[small xsmall].include?(normalized_size)}">Fun Fact</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="label label--small">Row 1, Cell 1</span></td>
            <td><span class="label#{' label--small' if normalized_size == 'xsmall'}">Row 1, Cell 2</span></td>
            <td><span class="label label--small">Row 1, Cell 3</span></td>
          </tr>
        </tbody>
      </table>
    HTML
  end
  # rubocop:enable Metrics/CyclomaticComplexity

  # Demo content for overflow management examples
  # rubocop:disable Metrics/MethodLength
  def overflow_demo_content
    {
      basic_tasks: [
        {
          index: 1,
          title: "Scranton Strategy Alignment & Cross-Department Fire Drill Postmortem",
          description: "Daily branch sync led by Michael where 'priorities' include bagel flavours and which Threat Level Midnight poster to hang. Roundtable covers blockers (Toby), budget (none), and action items like 'more jazz hands' for the next morale push.",
          time: "9:00 AM - 10:00 AM",
          status: "Confirmed"
        },
        {
          index: 2,
          title: "Client Roadmap: The 'Golden Ticket' Pitch for Very Important Paper People",
          description: "Quarterly review with a big account where Michael promises five golden discounts again. Agenda includes metrics (Kevin’s pie charts), demo of a stapler in Jell-O, and a feedback capture that definitely won’t become a roast of our copier.",
          time: "2:00 PM - 3:30 PM",
          status: "Tentative"
        },
        {
          index: 3,
          title: "Project Deadline: Final Dundee Ballot Submission & Chili Risk Assessment",
          description: "Submit final deliverables for the Dundies program, attach acceptance criteria (bow-tie optional), and circulate release notes reminding everyone not to run with a pot of chili. Post-release monitoring includes mopping and morale.",
          time: "11:59 PM",
          status: "Important"
        },
        {
          index: 4,
          title: "Party Planning Committee & Creed’s Quality Gate (Do Not Ask His Age)",
          description: "Themes reviewed for consistency, readability, and whether Dwight slipped in beet-based confetti again. Pairing encouraged; approval occurs once Angela stops judging the pun count.",
          time: "3:30 PM - 4:30 PM",
          status: "High Priority"
        }
      ],

      extended_tasks: [
        {
          index: 1,
          title: "Scranton Strategy Alignment & Cross-Department Fire Drill Postmortem",
          description: "Weekly alignment where Michael brings a whiteboard titled 'Vision Board' and Dwight brings a megaphone. We cover priorities (sell paper), blockers (also sell paper), and stakeholder comms (Jan keeps emailing 'no'). Includes a risk roundtable about candles near plasma TVs.",
          time: "9:00 AM - 10:00 AM",
          status: "Confirmed"
        },
        {
          index: 2,
          title: "Client Presentation: 'Threat Level Midnight' Business Cut",
          description: "Marquee client session featuring tasteful charts by Pam, heartfelt narration by Agent Michael Scarn, and exactly one confetti pop. Feedback collected, dignity mostly preserved.",
          time: "2:00 PM - 3:30 PM",
          status: "Tentative"
        },
        {
          index: 3,
          title: "Café Disco Launch & Dundies Seating Chart",
          description: "Turn in every form, tape down every extension cord, and finalize seating so no one sits near the speaker labelled 'BASS.' Creed volunteers to be DJ and then vanishes.",
          time: "11:59 PM",
          status: "Important"
        },
        {
          index: 4,
          title: "Complaint Box Sorting & Schrute Compliance Sweep",
          description: "Sort grievances ('too much jazz,' 'too little jazz'), verify stapler locations, and initial the 'identity theft = not a joke' acknowledgement sheet.",
          time: "3:30 PM - 4:30 PM",
          status: "High Priority"
        },
        {
          index: 5,
          title: "Server Closet Check & 'Kevin’s Famous' Recovery Drill",
          description: "Open the mystery door, wiggle the beeping thing, and attempt a restoration without spilling anything. Update instructions: 'bring oven mitts.'",
          time: "6:00 PM - 7:00 PM",
          status: "Automated"
        },
        {
          index: 6,
          title: "Security Walkthrough & 'Frame Toby' Boundary Review",
          description: "Monthly pass including badge checks, warehouse notes, and a plan that does not involve planting fake drugs in HR. Angela brings a clipboard and a stare.",
          time: "10:00 AM - 12:00 PM",
          status: "Critical"
        },
        {
          index: 7,
          title: "Quarterly Reviews & Growth Plan: The 'Assistant to the' Ladder",
          description: "Evaluate performance using a rubric Jim swears isn’t a prank. Clarify that 'Assistant to the Regional Manager' is technically growth if you squint.",
          time: "1:00 PM - 2:30 PM",
          status: "Scheduled"
        },
        {
          index: 8,
          title: "Sabre Printer Jam Night (Bring Marshmallows)",
          description: "Apply latest stickers, test that smell of burning goes down, and keep watch while Michael brainstorms catchphrases for 'a printer that catches fire less.'",
          time: "11:00 PM - 12:00 AM",
          status: "Maintenance"
        },
        {
          index: 9,
          title: "Onboarding Workshop: The Dundies for New Hires",
          description: "Welcome session covering desk decor, how to ignore Dwight’s evacuation drills, and what a Dundie is. Hands-on lab: unjamming the copier while smiling.",
          time: "9:30 AM - 11:30 AM",
          status: "Required"
        },
        {
          index: 10,
          title: "Budget Planning & 'Surplus' Allocation Meeting",
          description: "Q4 planning where Oscar explains the surplus gently, Michael hears 'new chairs,' and Recyclops is briefly appointed Treasurer of Petty Cash.",
          time: "3:00 PM - 5:00 PM",
          status: "Planning"
        },
        {
          index: 11,
          title: "Vendor Check-In & Utica Détente",
          description: "Quarterly vendor review covering deliveries, pricing, and whether Karen will accept a peace offering in the form of soft pretzels.",
          time: "2:00 PM - 3:00 PM",
          status: "Business"
        },
        {
          index: 12,
          title: "Bulletin Board Refresh & 'Fun Run' Postmortem",
          description: "Update flyers, retire 'Run for Rabies' glitter, and pin a cautionary note on carbo-loading before 5Ks. Remove anything last edited by 'William M. Buttlicker.'",
          time: "4:00 PM - 5:30 PM",
          status: "Documentation"
        },
        {
          index: 13,
          title: "Office Health Check & Beet Farm Capacity Plan",
          description: "Check plants, temperature wars, and snack drawer diplomacy. Forecast beet yields just in case we pivot to agriculture.",
          time: "8:00 AM - 9:00 AM",
          status: "Monitoring"
        },
        {
          index: 14,
          title: "Coffee Chat & 'Pretzel Day' Hype",
          description: "Informal bonding to share wins, learnings, and toppings. Scheduling anything on Pretzel Day is punishable by Stanley’s glare.",
          time: "10:15 AM - 10:45 AM",
          status: "Social"
        },
        {
          index: 15,
          title: "Vance Refrigeration Contract Walk-Through",
          description: "Go over terms with Phyllis and Bob. Everyone nods, someone says 'classy,' and the thermostat mysteriously gets colder.",
          time: "11:00 AM - 12:30 PM",
          status: "Business"
        },
        {
          index: 16,
          title: "Suggestion Box Archaeology",
          description: "Analyze themes, rank 'more jazz' vs 'less jazz,' and translate 'Stop stealing my pens (looking at you, Jim)' into action items.",
          time: "1:30 PM - 2:30 PM",
          status: "Research"
        },
        {
          index: 17,
          title: "Beach Games Capacity Alignment",
          description: "Plan teams, veto sumo suits, and identify who has 'coal-walk energy.' Crown no one via hot-dog-eating contest this time.",
          time: "3:00 PM - 4:00 PM",
          status: "Planning"
        },
        {
          index: 18,
          title: "Michael Scott Paper Company Comeback Rituals",
          description: "Codify traditions like celebratory pancakes, van air freshener procurement, and how many cheese puffs is 'a business expense.'",
          time: "4:30 PM - 6:00 PM",
          status: "Ceremony"
        },
        {
          index: 19,
          title: "Learning Session: 'Scott’s Tots' (What Not To Promise)",
          description: "A cautionary tale about promises, tuition, and the importance of reading fine print. Bring tissues and a respectful silence.",
          time: "5:00 PM - 6:00 PM",
          status: "Education"
        },
        {
          index: 20,
          title: "Branch Wars: Lessons Learned",
          description: "Reflect on what went well (matching bandanas), what didn’t (kidnapping a copier), and pledge fewer disguises on weekdays.",
          time: "6:00 PM - 7:00 PM",
          status: "Review"
        },
        {
          index: 21,
          title: "Parkour Safety Committee",
          description: "Establish rules: no vaulting over reception, no roof-to-truck, and absolutely no yelling 'PARKOUR!' near coffee cups.",
          time: "7:30 PM - 8:30 PM",
          status: "Safety"
        },
        {
          index: 22,
          title: "Monthly 'WUPHF' Etiquette & Usage Reports",
          description: "Review how many people were pinged on fax, pager, and pigeon. Identify experiments that use fewer exclamation points.",
          time: "9:00 PM - 10:00 PM",
          status: "Analytics-ish"
        },
        {
          index: 23,
          title: "Emergency Response & Fire Drill Protocol (Real, Not Dwight)",
          description: "Runbook review for real incidents including paging, escalation, and humane door-unlocking. Cat remains on the ground.",
          time: "12:00 AM - 12:00 AM",
          status: "Emergency"
        },
        {
          index: 24,
          title: "Quality Check: 'Product Recall' Edition",
          description: "Focus on critical paths, error stickers, and watermarking so the kids don’t prank us back. Apologies printed only last resort.",
          time: "4:00 PM - 5:30 PM",
          status: "Confirmed"
        },
        {
          index: 25,
          title: "Calendar Review & 'Casino Night' Planning",
          description: "Align dates, identify risks, and pretend this is not the most dramatic meeting since 'Ryan started a fire.'",
          time: "10:00 AM - 11:30 AM",
          status: "Alignment"
        },
        {
          index: 26,
          title: "Incident Postmortem: 'The Injury' Prevention Plan",
          description: "Walk through the timeline, document contributing factors such as foreheads meeting George Foreman grills, assign owners for fixes.",
          time: "1:00 PM - 2:00 PM",
          status: "Postmortem"
        },
        {
          index: 27,
          title: "Cleanup Session & 'Prison Mike' Speech Practice",
          description: "Target messy drawers, reduce chaos, add labels, and rehearse the part about dementors so it lands but HR doesn’t call.",
          time: "2:30 PM - 4:00 PM",
          status: "Tidy"
        },
        {
          index: 28,
          title: "‘Booze Cruise’ Dry Run & Do-Not-Rock-the-Boat",
          description: "Simulate a trip, practice speeches only when the boat is actually moving, and identify the life jacket with Michael’s name.",
          time: "7:00 PM - 8:00 PM",
          status: "DR Drill"
        },
        {
          index: 29,
          title: "New Copier Button Rollout & 'Subtle(?)' Signage Plan",
          description: "Define phased enablement, teach Michael that a toggle is not a clapper, and pick fonts that don’t start an argument.",
          time: "11:00 AM - 12:00 PM",
          status: "Rollout"
        },
        {
          index: 30,
          title: "Benihana Team Dinner Logistics & The Two-Tables Problem",
          description: "Coordinate seating so we know who is who this time. Confirm orders, identify the correct server, and practice gentle nodding.",
          time: "3:00 PM - 4:30 PM",
          status: "Logistics"
        },
        {
          index: 31,
          title: "Privacy Review & 'Email Surveillance' Boundaries",
          description: "Audit peeking habits, update 'no snooping' posters, and remind the team that surveillance episodes belong on DVDs.",
          time: "9:00 AM - 10:00 AM",
          status: "Compliance"
        },
        {
          index: 32,
          title: "Hiring Panel & 'Chair Model' Calibration",
          description: "Run interviews, agree that singing to a photo is not a necessary skill, and choose someone who understands copy paper.",
          time: "12:30 PM - 3:00 PM",
          status: "Hiring"
        },
        {
          index: 33,
          title: "Community AMA & 'Ask Me Anything Except Sales Numbers'",
          description: "Live Q&A with fans and power users about direction, upcoming bits, and whether Creed actually works here. He does. We think.",
          time: "5:00 PM - 6:00 PM",
          status: "Community"
        },
        {
          index: 34,
          title: "Finance Reconciliation & 'Boom Roasted' Report",
          description: "Monthly tally of invoices, payouts, refunds, and unexplained charges marked 'wolf dot com.' Oscar translates all of it.",
          time: "4:30 PM - 6:00 PM",
          status: "Finance"
        }
      ],

      development_tasks: [
        {
          index: 1,
          title: "Morning Standup at Reception",
          description: "Daily sync where Pam keeps us moving and Michael keeps us guessing.",
          time: "9:00 AM - 9:30 AM",
          status: "Daily"
        },
        {
          index: 2,
          title: "Beach Games Planning Session",
          description: "Plan the next games without walking across hot coals.",
          time: "10:30 AM - 12:00 PM",
          status: "Planning"
        },
        {
          index: 3,
          title: "Printer Jam Review with Jim & Dwight",
          description: "Review incidents and check for jelly-based sabotage.",
          time: "2:00 PM - 3:00 PM",
          status: "Review"
        },
        {
          index: 4,
          title: "Team Retro: Fun Run Debrief",
          description: "Share wins, fails, and carb choices.",
          time: "4:00 PM - 5:00 PM",
          status: "Retrospective"
        },
        {
          index: 5,
          title: "Sabre Pyramid Tablet Brainstorm (Why Triangle?)",
          description: "Discuss designs and why it is a triangle.",
          time: "3:30 PM - 4:30 PM",
          status: "Technical-ish"
        },
        {
          index: 6,
          title: "Client Demo: Michael Scarn Live",
          description: "Show features of paper and dodge finger guns.",
          time: "1:00 PM - 2:00 PM",
          status: "Demo"
        }
      ],

      operations_tasks: [
        {
          index: 1,
          title: "Move Boxes to 'Scranton 2.0' Annex",
          description: "Relabel everything and keep Kevin away from the dolly.",
          time: "11:00 PM - 12:00 AM",
          status: "Off-hours"
        },
        {
          index: 2,
          title: "Recyclops Recycling Protocol Drill",
          description: "Apply updates and recycle bad habits.",
          time: "11:00 PM - 11:30 PM",
          status: "Security"
        },
        {
          index: 3,
          title: "Parkour Practice (No Jumping Off Things)",
          description: "Validate excitement without vaulting over reception.",
          time: "6:00 PM - 7:00 PM",
          status: "Exercise"
        },
        {
          index: 4,
          title: "Backup Verification with Kevin’s Chili",
          description: "Check integrity and keep lids secure.",
          time: "12:00 AM - 12:30 AM",
          status: "Maintenance"
        },
        {
          index: 5,
          title: "Expense Report Tidy with Oscar",
          description: "Review anomalies and explain them patiently.",
          time: "8:00 AM - 9:00 AM",
          status: "Monitoring"
        },
        {
          index: 6,
          title: "WUPHF Notification Tuning (Fewer Pings)",
          description: "Configure alerts that don’t ping everyone.",
          time: "5:00 PM - 6:00 PM",
          status: "Configuration"
        }
      ],

      business_tasks: [
        {
          index: 1,
          title: "Budget Review: The Surplus",
          description: "Plan spending before Michael buys chairs.",
          time: "10:00 AM - 11:00 AM",
          status: "Financial"
        },
        {
          index: 2,
          title: "Vendor Assessment with Utica",
          description: "Evaluate providers and avoid copier heists.",
          time: "2:30 PM - 3:30 PM",
          status: "Procurement"
        },
        {
          index: 3,
          title: "Contract Renewal: Vance Refrigeration",
          description: "Negotiate terms and keep it classy, Bob.",
          time: "4:00 PM - 5:00 PM",
          status: "Legal"
        },
        {
          index: 4,
          title: "Market Analysis: Prince Family Paper",
          description: "Research competition without cheating. Much.",
          time: "1:00 PM - 2:00 PM",
          status: "Research"
        },
        {
          index: 5,
          title: "Compliance Audit: Email Surveillance",
          description: "Annual check that stops just short of peeking.",
          time: "9:00 AM - 10:00 AM",
          status: "Compliance"
        }
      ],

      # Grouped data for Group Headers examples
      grouped_tasks: {
        today: [
          {
            index: 1,
            title: "Morning Meeting at Reception",
            description: "Team sync and birthday signings",
            time: "9:00 AM - 9:30 AM",
            status: "Daily"
          },
          {
            index: 2,
            title: "Printer Jam Review with Dwight",
            description: "Check for bear-related bugs",
            time: "10:30 AM - 11:30 AM",
            status: "Review"
          },
          {
            index: 3,
            title: "Lunch at Benihana",
            description: "Team lunch with identical tables",
            time: "12:30 PM - 1:30 PM",
            status: "Break"
          },
          {
            index: 4,
            title: "Status Report to Corporate",
            description: "Weekly progress and sass",
            time: "4:00 PM - 4:30 PM",
            status: "Reporting"
          }
        ],
        tomorrow: [
          {
            index: 1,
            title: "Beach Games Planning",
            description: "Plan next two weeks",
            time: "10:00 AM - 12:00 PM",
            status: "Planning"
          },
          {
            index: 2,
            title: "Client Demo: WUPHF",
            description: "Show new 'features' of shouting",
            time: "2:00 PM - 3:00 PM",
            status: "Demo"
          },
          {
            index: 3,
            title: "Sabre Triangle Tablet Brainstorm",
            description: "Discuss shape-based confidence",
            time: "4:00 PM - 5:00 PM",
            status: "Technical-ish"
          }
        ],
        this_week: [
          {
            index: 1,
            title: "Security Walkthrough with IT Guy",
            description: "Quarterly review",
            time: "Wednesday",
            status: "Security"
          },
          {
            index: 2,
            title: "Team Retro: Goodbye, Toby",
            description: "Sprint reflection (but no sprints)",
            time: "Friday",
            status: "Retrospective"
          },
          {
            index: 3,
            title: "Parkour Practice",
            description: "Energy test without ceilings",
            time: "Thursday",
            status: "Testing-ish"
          }
        ]
      },

      # Extended grouped data for the overflow example
      extended_grouped_tasks: {
        today: [
          {
            index: 1,
            title: "Morning Meeting: Threat Level Check-in",
            description: "Team sync and updates",
            time: "9:00 AM - 9:30 AM",
            status: "Daily"
          },
          {
            index: 2,
            title: "Identity Theft Watch",
            description: "Review suspicious 'Jim' behaviours",
            time: "10:30 AM - 11:30 AM",
            status: "Review"
          },
          {
            index: 3,
            title: "Lunch Break: Pretzel Day Prep",
            description: "Team lunch at downtown",
            time: "12:30 PM - 1:30 PM",
            status: "Break"
          },
          {
            index: 4,
            title: "Client Call with Jan",
            description: "Weekly check-in with stakeholders",
            time: "2:00 PM - 3:00 PM",
            status: "Client"
          },
          {
            index: 5,
            title: "Complaint Sorting: Product Recall",
            description: "Prioritize reported issues",
            time: "3:30 PM - 4:30 PM",
            status: "Complaints"
          },
          {
            index: 6,
            title: "Bulletin Board Update: Dundies",
            description: "Update nominations and categories",
            time: "4:30 PM - 5:30 PM",
            status: "Docs"
          },
          {
            index: 7,
            title: "End of Day Sync: Café Disco",
            description: "Review progress and blockers",
            time: "5:30 PM - 6:00 PM",
            status: "Sync"
          }
        ],
        tomorrow: [
          {
            index: 1,
            title: "Beach Games Roll-Call",
            description: "Confirm capacity without hot coals",
            time: "10:00 AM - 12:00 PM",
            status: "Planning"
          },
          {
            index: 2,
            title: "Stakeholder Presentation: Threat Level Midnight",
            description: "Tasteful metrics, minimal fireworks",
            time: "2:00 PM - 3:30 PM",
            status: "Presentation"
          },
          {
            index: 3,
            title: "Oscar’s Index Intervention (Of Spreadsheets)",
            description: "Deep dive into the budget tabs",
            time: "9:00 AM - 11:00 AM",
            status: "Numbers"
          },
          {
            index: 4,
            title: "Parkour QA Gauntlet (Very Gentle)",
            description: "Functionality verified: walking",
            time: "1:00 PM - 3:00 PM",
            status: "QA-ish"
          },
          {
            index: 5,
            title: "Campaign Analysis: WUPHF Without The WUPHF",
            description: "Less shouting, more smiling",
            time: "4:00 PM - 5:30 PM",
            status: "Marketing"
          }
        ],
        this_week: [
          {
            index: 1,
            title: "Warehouse to Cloud (No Forklifts)",
            description: "Move boxes, label feelings",
            time: "Wednesday",
            status: "Infrastructure-ish"
          },
          {
            index: 2,
            title: "Customer Satisfaction Review: 'Did I Stutter?'",
            description: "Improve smiles per hour",
            time: "Thursday",
            status: "Customer Success"
          },
          {
            index: 3,
            title: "Benihana to Back Office Coordination",
            description: "We will know who is who",
            time: "Friday",
            status: "Integration-ish"
          },
          {
            index: 4,
            title: "Data Deep Dive: Boom, Roasted (With Charts)",
            description: "Roasts limited to pie charts",
            time: "Monday",
            status: "Analytics"
          },
          {
            index: 5,
            title: "Accessibility: Conference Room B Upgrades",
            description: "Less squinting, more seeing",
            time: "Tuesday",
            status: "Accessibility"
          },
          {
            index: 6,
            title: "Respect the Dashboard (Of Feelings)",
            description: "Set baselines for vibes",
            time: "Wednesday",
            status: "Monitoring"
          },
          {
            index: 7,
            title: "The Dundies of Growth",
            description: "Skills, mentoring, zero karaoke tears",
            time: "Friday",
            status: "Development"
          }
        ]
      }
    }
  end
  # rubocop:enable Metrics/MethodLength

  # Build grouped demo data from the extended_tasks set to control item counts per group
  # Today: 5 items, Tomorrow: 6 items, This Week: remainder
  def overflow_grouped_from_extended_tasks
    ext = overflow_demo_content[:extended_tasks] || []
    {
      today: ext.first(5),
      tomorrow: ext.drop(5).first(6),
      this_week: ext.drop(11)
    }
  end

  # Demo content for clamp examples with longer descriptions
  # rubocop:disable Metrics/MethodLength
  def clamp_demo_content
    {
      extended_grouped_tasks: {
        today: [
          {
            index: 1,
            title: "Product Strategy: The Michael Scott Paper Company Gambit",
            description: "A sweeping strategy session where Michael outlines a visionary go-to-market involving cheaper paper, more charisma, and an office in a closet. Market forces are examined until someone brings pancakes and the meeting becomes 40% brunch, 60% shouting 'We’re back, baby!' Action items include 'win on charm,' 'borrow more chairs,' and 'stop calling the van the Sales Jet.'",
            time: "9:00 AM - 10:30 AM",
            status: "Strategy"
          },
          {
            index: 2,
            title: "Triangle Justification: Sabre Pyramid Tablet",
            description: "A deep dive into why a triangle is the strongest shape and therefore a fine form factor for a device that prints sometimes and catches fire less often. Weigh alternatives against Michael’s insistence on calling it 'The TriPad,' while Erin tries to fold the brochure into a hat that convinces no one but looks sensational.",
            time: "11:00 AM - 12:30 PM",
            status: "Technical-ish"
          },
          {
            index: 3,
            title: "Pam’s Focus Group (No Michael Allowed… Maybe)",
            description: "Comprehensive research with interviews, pop-ins from Creed that we pretend are users, and a tour of pain points like doors that lock during fire drills. We analyze patterns, surface the question 'why is there a pyramid,' and create actions that improve the experience without adding more jazz hands, which tests at capacity.",
            time: "2:00 PM - 3:30 PM",
            status: "UX (Office)"
          },
          {
            index: 4,
            title: "Security Compliance: Frame Toby? No.",
            description: "A thorough review that reassures legal while letting Dwight present a 47-slide deck on desk surveillance. We cover access controls (do not tape keys under mouse pads), encryption (whisper), and incident response that does not include planting anything in HR’s desk. The phrase 'it was just a test' is banned.",
            time: "4:00 PM - 5:30 PM",
            status: "Security"
          },
          {
            index: 5,
            title: "Cross-Team Workshop: The Café Disco Accord",
            description: "An interactive workshop on collaboration using the proven method of dancing in the annex. We set communication norms, define shared objectives, align timelines, and codify a policy for spontaneous dance breaks that keep morale high without colliding with Stanley on Pretzel Day (a firing offense, spiritually).",
            time: "3:30 PM - 5:00 PM",
            status: "Collaboration"
          }
        ],
        tomorrow: [
          {
            index: 1,
            title: "Beach Games Capacity Roll-Call",
            description: "An exhaustive planning session where capacity is confirmed without hot coals. Events include Egg Toss of Trust, Sumo Suit Regret (canceled), and The Inflatable Slide That Angela Hates. Everyone leaves with goals and a vow to never again settle management via hot-dog-eating contest, even if it was thrilling.",
            time: "10:00 AM - 12:00 PM",
            status: "Planning"
          },
          {
            index: 2,
            title: "Stakeholder Presentation: Threat Level Midnight (Business Cut)",
            description: "A high-stakes deck for executives featuring a tasteful montage where Agent Michael Scarn defeats budget variance with the power of friendship. Feedback is collected, parking-lot items are parked, and the only explosion is a confetti cannon labelled 'Do Not Pull (Michael).' He pulls it.",
            time: "2:00 PM - 3:30 PM",
            status: "Presentation"
          },
          {
            index: 3,
            title: "Oscar’s Index Intervention",
            description: "An intensive workshop on spreadsheets that finally answers Kevin’s question: 'Can we expense extra napkins for chili?' Slow tabs are analyzed, charts are installed, and maintenance is scheduled during hours when Michael is least likely to rebrand the budget 'Money-opoly.'",
            time: "9:00 AM - 11:00 AM",
            status: "Numbers"
          },
          {
            index: 4,
            title: "Parkour QA Gauntlet",
            description: "A comprehensive cross-hallway test that validates walking, light jogging, and the dismount known as 'politely opening a door.' Bug triage avoids ceiling tiles; parity across departments is verified without jumping onto a truck. The word 'PARKOUR!' is limited to twice per person.",
            time: "1:00 PM - 3:00 PM",
            status: "QA-ish"
          },
          {
            index: 5,
            title: "Campaign Analysis: WUPHF Without The WUPHF",
            description: "A measured analysis of clicks, clacks, and fax machine shrieks that politely retires multi-channel all-caps alerts. We identify optimizations that do not ping everyone at once, commit to whispering for one sprint, and place the megaphone in rice (symbolically).",
            time: "4:00 PM - 5:30 PM",
            status: "Marketing"
          }
        ],
        this_week: [
          {
            index: 1,
            title: "Migration Planning: Warehouse to Cloud (No Forklifts)",
            description: "A strategic plan covering boxes, carts, snacks, and morale, with cost optimization tackled using the same vigor Michael reserves for improv. The phrase 'lift and shift' is taken literally once; no one is injured; a pallet jack is declared Regional Manager of Moving.",
            time: "Wednesday",
            status: "Infrastructure-ish"
          },
          {
            index: 2,
            title: "Customer Success Review: 'Did I Stutter?' Edition",
            description: "A full review of CSAT (Customer Smiles And Treats), ticket trends (mostly pretzels), adoption (high on Pretzel Day), and feedback themes. Action plans improve retention without requiring Stanley to say anything twice.",
            time: "Thursday",
            status: "Customer Success"
          },
          {
            index: 3,
            title: "Integration Workshop: Benihana to Back Office",
            description: "A practical session on getting from table A to table B without switching people mid-story. Hands-on exercises prove we can identify the right server and the right table, every time, even when Michael insists the chef is his best friend.",
            time: "Friday",
            status: "Integration-ish"
          },
          {
            index: 4,
            title: "Data Analytics Deep Dive: Boom, Roasted (With Charts)",
            description: "A serious exploration of behaviour analysis that roasts errors gently while landing insights firmly. Decisions become data-driven instead of vibe-driven; roasts are limited to pie charts and the occasional Kevin eyebrow.",
            time: "Monday",
            status: "Analytics"
          },
          {
            index: 5,
            title: "Accessibility Implementation: Conference Room B Upgrades",
            description: "A practical push toward comfort that improves visibility, legibility, and 'the door doesn’t lock itself during drills.' We document improvements and retire the phrase 'just squint.'",
            time: "Tuesday",
            status: "Accessibility"
          },
          {
            index: 6,
            title: "Performance Monitoring Setup: Respect the Dashboard",
            description: "A mature rollout of a whiteboard that tracks vibes, pretzels, copier jams, and Meredith’s helmet. SLAs are defined (Stanley’s Lunch Agreements), baselines established, and regression detection is Angela’s eyebrow.",
            time: "Wednesday",
            status: "Monitoring"
          },
          {
            index: 7,
            title: "Team Development Workshop: The Dundies of Growth",
            description: "A development day covering skills, mentoring, knowledge sharing, and career planning. Everyone sets goals, nobody cries in the Chili’s parking lot, and confidence increases without karaoke (optional, but powerful).",
            time: "Friday",
            status: "Development"
          }
        ]
      }
    }
  end
  # rubocop:enable Metrics/MethodLength

  # Render a task item with consistent structure
  def render_task_item(task)
    title_attributes = task[:title_attributes] || {}
    description_attributes = task[:description_attributes] || {}

    content_tag(:div, class: 'item') do
      content_tag(:div, class: 'meta') do
        content_tag(:span, task[:index], class: 'index')
      end +
        content_tag(:div, class: 'content') do
          # Merge classes safely so base classes are preserved
          ta = title_attributes.dup
          da = description_attributes.dup
          title_extra_class = ta.delete(:class) || ta.delete('class')
          desc_extra_class  = da.delete(:class) || da.delete('class')

          title_classes = ['title title--small', title_extra_class].compact.join(' ')
          desc_classes  = ['description', desc_extra_class].compact.join(' ')

          content_tag(:span, task[:title], { class: title_classes }.merge(ta)) +
            content_tag(:span, task[:description], { class: desc_classes }.merge(da)) +
            content_tag(:div, class: 'flex gap--small') do
              content_tag(:span, task[:time], class: 'label label--small label--underline') +
                content_tag(:span, task[:status], class: 'label label--small label--underline')
            end
        end
    end
  end

  # Render a group header for grouped content
  def render_group_header(title)
    content_tag(:span, title, class: 'label label--base group-header', data: { group_header: true })
  end

  # =============================
  # Responsive tests
  # =============================

  def framework_responsive_background_rows
    [
      {
        class: 'md:bg--gray-50',
        mixin: "@include screen.screen('md')",
        description: 'Gray bg on md+ screens',
        mixin_inner_html: content_tag(:div, '', id: 'bg-size-md-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: 'portrait:bg--gray-50',
        mixin: "@include screen.screen('portrait')",
        description: 'Gray bg in portrait',
        mixin_inner_html: content_tag(:div, '', id: 'bg-orientation-portrait-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'portrait:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: '2bit:bg--gray-50',
        mixin: "@include screen.screen('2bit')",
        description: 'Gray bg on 2-bit screens',
        mixin_inner_html: content_tag(:div, '', id: 'bg-bit-depth-2bit-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: '2bit:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: 'md:portrait:bg--gray-50',
        mixin: "@include screen.screen('md', 'portrait')",
        description: 'Gray bg on md+ portrait',
        mixin_inner_html: content_tag(:div, '', id: 'bg-size-orientation-md-portrait-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:portrait:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: 'md:2bit:bg--gray-50',
        mixin: "@include screen.screen('md', '2bit')",
        description: 'Gray bg on md+ 2-bit',
        mixin_inner_html: content_tag(:div, '', id: 'bg-size-bit-depth-md-2bit-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:2bit:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: 'portrait:2bit:bg--gray-50',
        mixin: "@include screen.screen('portrait', '2bit')",
        description: 'Gray bg on portrait 2-bit',
        mixin_inner_html: content_tag(:div, '', id: 'bg-orientation-bit-depth-portrait-2bit-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'portrait:2bit:bg--gray-50 w--12 h--12 rounded--medium')
      },
      {
        class: 'md:portrait:2bit:bg--gray-50',
        mixin: "@include screen.screen('md', 'portrait', '2bit')",
        description: 'Gray bg on md+ portrait 2-bit',
        mixin_inner_html: content_tag(:div, '', id: 'bg-all-md-portrait-2bit-mixin', class: 'w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:portrait:2bit:bg--gray-50 w--12 h--12 rounded--medium')
      }
    ]
  end

  def framework_responsive_visibility_rows
    [
      {
        class: 'sm:hidden',
        mixin: "@include screen.screen('sm')",
        description: 'Hidden on sm+ screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-size-sm-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'sm:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: 'portrait:hidden',
        mixin: "@include screen.screen('portrait')",
        description: 'Hidden on portrait screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-orientation-portrait-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'portrait:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: '4bit:hidden',
        mixin: "@include screen.screen('4bit')",
        description: 'Hidden on 4-bit screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-bit-depth-4bit-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: '4bit:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: 'md:portrait:hidden',
        mixin: "@include screen.screen('md', 'portrait')",
        description: 'Hidden on md+ portrait screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-size-orientation-md-portrait-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:portrait:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: 'lg:2bit:hidden',
        mixin: "@include screen.screen('lg', '2bit')",
        description: 'Hidden on lg+ 2-bit screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-size-bit-depth-lg-2bit-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'lg:2bit:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: 'portrait:4bit:hidden',
        mixin: "@include screen.screen('portrait', '4bit')",
        description: 'Hidden on portrait 4-bit screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-orientation-bit-depth-portrait-4bit-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'portrait:4bit:hidden bg--gray-65 w--12 h--12 rounded--medium')
      },
      {
        class: 'md:portrait:2bit:hidden',
        mixin: "@include screen.screen('md', 'portrait', '2bit')",
        description: 'Hidden on md+ portrait 2-bit screens',
        mixin_inner_html: content_tag(:div, '', id: 'vis-all-md-portrait-2bit-hidden-mixin', class: 'bg--gray-65 w--12 h--12 rounded--medium'),
        class_inner_html: content_tag(:div, '', class: 'md:portrait:2bit:hidden bg--gray-65 w--12 h--12 rounded--medium')
      }
    ]
  end

  def framework_responsive_text_rows
    [
      {
        class: 'lg:text--center',
        mixin: "@include screen.screen('lg')",
        description: 'Centered text on lg+ screens',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-size-lg-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'lg:text--center w--full')
      },
      {
        class: 'portrait:text--center',
        mixin: "@include screen.screen('portrait')",
        description: 'Centered text in portrait',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-orientation-portrait-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'portrait:text--center w--full')
      },
      {
        class: '2bit:text--center',
        mixin: "@include screen.screen('2bit')",
        description: 'Centered text on 2-bit screens',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-bit-depth-2bit-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: '2bit:text--center w--full')
      },
      {
        class: 'md:portrait:text--center',
        mixin: "@include screen.screen('md', 'portrait')",
        description: 'Centered on md+ portrait',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-size-orientation-md-portrait-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'md:portrait:text--center w--full')
      },
      {
        class: 'lg:4bit:text--center',
        mixin: "@include screen.screen('lg', '4bit')",
        description: 'Centered on lg+ 4-bit screens',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-size-bit-depth-lg-4bit-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'lg:4bit:text--center w--full')
      },
      {
        class: 'portrait:2bit:text--center',
        mixin: "@include screen.screen('portrait', '2bit')",
        description: 'Centered on portrait 2-bit screens',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-orientation-bit-depth-portrait-2bit-center-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'portrait:2bit:text--center w--full')
      },
      {
        class: 'md:portrait:2bit:text--right',
        mixin: "@include screen.screen('md', 'portrait', '2bit')",
        description: 'Right-aligned on md+ portrait 2-bit',
        mixin_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), id: 'text-all-md-portrait-2bit-right-mixin', class: 'w--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Aa', class: 'value'), class: 'md:portrait:2bit:text--right w--full')
      }
    ]
  end

  def framework_responsive_flex_rows
    [
      {
        class: 'md:flex--center',
        mixin: "@include screen.screen('md')",
        description: 'Centered on md+ screens',
        mixin_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small').html_safe, id: 'flex-size-md-center-mixin', class: 'flex flex--row w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small').html_safe, class: 'flex flex--row md:flex--center w--full h--full')
      },
      {
        class: 'portrait:flex--col',
        mixin: "@include screen.screen('portrait')",
        description: 'Column layout in portrait',
        mixin_inner_html: content_tag(
          :div,
          content_tag(
            :div,
            safe_join([content_tag(:div, '', class: 'bg--gray-65 w--6 h--6 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--6 h--6 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--6 h--6 rounded--small')]),
            id: 'flex-orientation-portrait-col-mixin',
            class: 'flex flex--row gap--small'
          ),
          class: 'flex flex--row w--full flex--center'
        ),
        class_inner_html: content_tag(
          :div,
          content_tag(
            :div,
            safe_join([content_tag(:div, '', class: 'bg--gray-65 w--6 h--6 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--6 h--6 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--6 h--6 rounded--small')]),
            class: 'flex flex--row portrait:flex--col gap--small'
          ),
          class: 'flex flex--row w--full flex--center'
        )
      },
      {
        class: 'lg:portrait:flex--center',
        mixin: "@include screen.screen('lg', 'portrait')",
        description: 'Centered on lg+ portrait',
        mixin_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small').html_safe, id: 'flex-size-orientation-lg-portrait-center-mixin', class: 'flex flex--row w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small').html_safe, class: 'flex flex--row lg:portrait:flex--center w--full h--full')
      }
    ]
  end

  def framework_responsive_spacing_rows
    [
      {
        class: 'md:p--24',
        mixin: "@include screen.screen('md')",
        description: 'Padding 24 on md+ screens',
        mixin_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--white rounded--small').html_safe, id: 'spacing-size-md-p-24-mixin', class: 'bg--gray-65 rounded--medium'),
        class_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--white rounded--small').html_safe, class: 'md:p--24 bg--gray-65 rounded--medium')
      },
      {
        class: 'portrait:mx--20',
        mixin: "@include screen.screen('portrait')",
        description: 'Horizontal margin 20 in portrait',
        mixin_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--white rounded--small').html_safe, id: 'spacing-orientation-portrait-mx-20-mixin', class: 'bg--gray-65 rounded--medium'),
        class_inner_html: content_tag(:div, content_tag(:div, '', class: 'bg--white rounded--small').html_safe, class: 'portrait:mx--20 bg--gray-65 rounded--medium')
      }
    ]
  end

  def framework_responsive_gap_rows
    [
      {
        class: 'lg:gap--xlarge',
        mixin: "@include screen.screen('lg')",
        description: 'Gap xlarge on lg+ screens',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--12 h--12 rounded--small')]),
          id: 'gap-size-lg-xlarge-mixin',
          class: 'flex flex--row'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--12 h--12 rounded--small')]),
          class: 'gap lg:gap--xlarge flex flex--row'
        )
      },
      {
        class: 'portrait:gap--large',
        mixin: "@include screen.screen('portrait')",
        description: 'Large gap in portrait',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--12 h--12 rounded--small')]),
          id: 'gap-orientation-portrait-large-mixin',
          class: 'flex flex--row'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--12 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--12 h--12 rounded--small')]),
          class: 'portrait:gap--large flex flex--row'
        )
      }
    ]
  end

  def framework_responsive_size_rows
    [
      {
        class: 'md:w--36',
        mixin: "@include screen.screen('md')",
        description: 'Large width on md+ screens',
        mixin_inner_html: content_tag(:div, '', id: 'size-size-md-w-36-mixin', class: 'bg--gray-65 h--12 rounded--small'),
        class_inner_html: content_tag(:div, '', class: 'md:w--36 bg--gray-65 w--12 h--12 rounded--small')
      }
    ]
  end

  def framework_responsive_rounded_rows
    [
      {
        class: 'md:rounded--xlarge',
        mixin: "@include screen.screen('md')",
        description: 'Rounded xlarge on md+ screens',
        mixin_inner_html: content_tag(:div, '', id: 'rounded-size-md-xlarge-mixin', class: 'bg--gray-65 w--12 h--12'),
        class_inner_html: content_tag(:div, '', class: 'md:rounded--xlarge bg--gray-65 w--12 h--12')
      }
    ]
  end

  def framework_responsive_grid_rows
    [
      {
        class: 'md:grid--cols-3',
        mixin: "@include screen.screen('md')",
        description: '3 columns on md+ screens',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 h--12 rounded--small')]),
          id: 'grid-size-md-cols-3-mixin',
          class: 'grid'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 h--12 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 h--12 rounded--small')]),
          class: 'grid md:grid--cols-3'
        )
      }
    ]
  end

  def framework_responsive_base_layout_rows
    [
      {
        class: 'md:layout--col',
        mixin: "@include screen.screen('md')",
        description: 'Column layout on md+ screens',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--16 h--16 rounded--small')]),
          id: 'layout-size-md-col-mixin',
          class: 'layout layout--row p--4 h--full w--full'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--16 h--16 rounded--small')]),
          class: 'layout layout--row md:layout--col p--4 h--full w--full'
        )
      },
      {
        class: 'portrait:layout--bottom',
        mixin: "@include screen.screen('portrait')",
        description: 'Bottom alignment in portrait',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small')]),
          id: 'layout-orientation-portrait-bottom-mixin',
          class: 'layout layout--row p--4 h--full'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small')]),
          class: 'layout layout--row portrait:layout--bottom p--4 h--full'
        )
      },
      {
        class: 'lg:portrait:layout--bottom',
        mixin: "@include screen.screen('lg', 'portrait')",
        description: 'Bottom alignment on lg+ portrait',
        mixin_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--16 h--16 rounded--small')]),
          id: 'layout-size-orientation-lg-portrait-bottom-mixin',
          class: 'layout layout--row p--4 h--full'
        ),
        class_inner_html: content_tag(
          :div,
          safe_join([content_tag(:div, '', class: 'bg--gray-65 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-50 w--16 h--16 rounded--small'), content_tag(:div, '', class: 'bg--gray-35 w--16 h--16 rounded--small')]),
          class: 'layout layout--row lg:portrait:layout--bottom p--4 h--full'
        )
      }
    ]
  end

  def framework_responsive_value_rows
    [
      {
        class: 'md:value--large',
        description: 'Large value on md+ screens',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value md:value--large')
      },
      {
        class: 'portrait:value--large',
        description: 'Large value in portrait',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value portrait:value--large')
      },
      {
        class: '4bit:value--large',
        description: 'Large value on 4-bit screens',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value 4bit:value--large')
      },
      {
        class: 'lg:portrait:value--large',
        description: 'Large value on lg+ portrait',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value lg:portrait:value--large')
      },
      {
        class: 'md:2bit:value--large',
        description: 'Large value on md+ 2-bit screens',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value md:2bit:value--large')
      },
      {
        class: 'portrait:4bit:value--large',
        description: 'Large value on portrait 4-bit',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value portrait:4bit:value--large')
      },
      {
        class: 'lg:portrait:4bit:value--xlarge',
        description: 'XLarge on lg+ portrait 4-bit',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:span, 'Aa', class: 'value lg:portrait:4bit:value--xlarge')
      }
    ]
  end

  def framework_responsive_label_rows
    [
      {
        class: 'md:label--small',
        description: 'Small label on md+ screens',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label md:label--small'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: 'portrait:label--outline',
        description: 'Outlined label in portrait',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label portrait:label--outline'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: '2bit:label--inverted',
        description: 'Inverted label on 2-bit screens',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label 2bit:label--inverted'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: 'md:portrait:label--underline',
        description: 'Underlined label on md+ portrait',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label md:portrait:label--underline'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: 'md:2bit:label--gray',
        description: 'Gray label on md+ 2-bit',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label md:2bit:label--gray'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: 'portrait:2bit:label--small',
        description: 'Small label on portrait 2-bit',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label portrait:2bit:label--small'), class: 'layout layout--row layout--center w--full h--full')
      },
      {
        class: 'md:portrait:2bit:label--inverted',
        description: 'Inverted label on md+ portrait 2-bit',
        mixin_container_class: 'opacity-20',
        mixin_inner_html: content_tag(:div, render('shared/icons/close'), class: 'layout layout--row layout--center w--full h--full'),
        class_inner_html: content_tag(:div, content_tag(:span, 'Label', class: 'label md:portrait:2bit:label--inverted'), class: 'layout layout--row layout--center w--full h--full')
      }
    ]
  end

  # rubocop:disable Metrics/MethodLength, Layout/LineLength
  def content_limiter_examples
    {
      dinner_party: content_tag(:span, 'Dinner Party', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "Michael finally manages to trick Jim and Pam into coming over to his condo for a couples’ dinner with him and Jan. He has been begging them for ages, and they finally run out of excuses."),
                      content_tag(:p, "The first thing Michael shows off is his pride and joy: a plasma TV mounted on the living room wall. The problem is that it is laughably tiny, barely larger than a computer monitor. Michael beams with pride as he demonstrates how it can “push right back against the wall” to save space, while Jim and Pam exchange polite smiles that barely conceal their disbelief."),
                      content_tag(:p, "Things take a sharper turn when Jan puts on a CD. The music is recorded by her former assistant, Hunter, and the lyrics make it sound like the two of them were more than just colleagues. Jan sways to the music with a dreamy smile, while Michael tries to ignore the implication. Jim and Pam sit frozen, realizing they have front-row seats to a relationship meltdown."),
                      content_tag(:p, "Dinner itself is no relief. Jan’s cooking is nowhere near ready, so the group is stuck nibbling on appetizers for what feels like hours. When the food does arrive, Jan scolds Michael for trying to eat early, and their bickering turns openly hostile. Andy and Angela, the other guests, sit uncomfortably as the couple jabs at each other across the table. Every sarcastic comment cuts deeper, and the laughter that should fill a dinner party never comes."),
                      content_tag(:p, "Michael, in a desperate attempt to lighten the mood, suggests games. They try charades, but even that devolves into more fighting. Jan mocks Michael’s answers, Michael whines back, and suddenly it feels less like a game and more like another round of public humiliation. The tiny condo seems to shrink with every cutting remark."),
                      content_tag(:p, "It all finally explodes when Jan accuses Michael of being childish and Michael lashes out in return. In her fury, Jan grabs one of his beloved Dundie trophies and hurls it at the plasma TV, shattering it. For Michael, this little TV was his greatest treasure, and now it lies in pieces on the floor. The room falls into stunned silence as everyone realizes the night has gone completely off the rails."),
                      content_tag(:p,
                                  "The guests slowly make their exit while Jan and Michael continue to argue in the background. Jim and Pam are relieved just to escape with their sanity intact. What started as a simple dinner party turned into one of the most uncomfortable nights anyone could imagine. For viewers, it is both painful and hilarious, a perfect storm of Michael’s desperate need to impress and Jan’s seething resentment. And right at the center of it all, that ridiculous little plasma TV never stood a chance.")
                    ])
        end,

      scotts_tots: content_tag(:span, 'Scott’s Tots', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "Michael proudly struts into a high school classroom filled with expectant seniors, all of whom have been promised by him years earlier that he would pay for their college tuition. The moment is set up like a triumphant return; the students cheer and clap as Michael enters, and for a fleeting second, he basks in the illusion of being a hero. Their excitement is palpable, with handmade signs and chants of 'Thank you, Mr. Scott!' ringing in his ears."),
                      content_tag(:p, "But underneath Michael’s forced smile lies sheer panic. As he begins his speech, his voice quivers ever so slightly, betraying his nerves. He tries to stretch out his introduction with jokes and awkward pauses, desperately searching for a way to soften the devastating truth he has to deliver. The students, however, hang on his every word, their faces glowing with hope and admiration for the man they believe has single-handedly secured their futures."),
                      content_tag(:p,
                                  "When the truth finally comes out - that Michael does not, in fact, have the money to pay for their tuition - the atmosphere in the room collapses instantly. Gasps and groans replace the cheers, and disbelief spreads across the room like a wave. Michael attempts to salvage the moment by offering to pay for everyone’s laptop batteries, a pathetic gesture that only highlights the absurdity of his promise. The crushing disappointment on the students’ faces makes the scene almost unbearable to watch."),
                      content_tag(:p, "The pain of the moment is amplified by how sincerely Michael believed in his original promise. Years earlier, he had genuinely thought he would become wealthy enough to follow through, blinded by his own optimism and detachment from reality. Now, forced to confront the impossibility of his pledge, he tries to laugh it off and hide behind humor, but the room is heavy with betrayal and crushed dreams."),
                      content_tag(:p,
                                  "As the students press him with questions and accusations, Michael becomes visibly smaller, almost shrinking into himself. His usual bravado evaporates as he stammers and dodges eye contact. The power dynamic has shifted completely - no longer the adored benefactor, he is now the object of ridicule and anger. The laughter in this scene comes not from jokes, but from the unbearable awkwardness of Michael’s failed attempt to maintain dignity in an impossible situation."),
                      content_tag(:p, "What makes 'Scott’s Tots' legendary is the raw, secondhand embarrassment it evokes. Viewers squirm in discomfort as Michael struggles, yet it is impossible to look away. It’s a perfect example of how The Office blends comedy and tragedy, creating a scene so painful that it loops back around into being hilarious. The genius lies in how Michael’s delusions of grandeur are shattered not with slapstick, but with the crushing weight of reality."),
                      content_tag(:p, "By the time Michael leaves the classroom, he is utterly defeated, his reputation destroyed in front of dozens of hopeful young people. For the students, it’s the death of a dream. For Michael, it’s yet another reminder of how his desperate need to be loved and admired leads him into catastrophic decisions. And for the audience, it’s a masterclass in cringe comedy, one of the most excruciating yet unforgettable moments in television history.")
                    ])
        end,

      prison_mike: content_tag(:span, 'Prison Mike', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "When the office staff complain that work feels like prison, Michael decides the only responsible thing to do is educate them - by transforming into a cautionary tale. He frames it as a necessary intervention, the kind of hard truth only a courageous leader can deliver, and you can see the excitement building as he prepares to debut his latest persona."),
                      content_tag(:p, "He strides back in with a purple bandana tied tight, drops his voice into a cartoonish growl, and declares himself 'Prison Mike.' He prowls the floor between desks, demanding attention like a substitute teacher who has watched one too many crime dramas, punctuating every other sentence with dramatic pauses and finger-pointing as if he’s narrating a documentary only he can see."),
                      content_tag(:p, "What follows is a torrent of wildly inconsistent 'facts' about prison life. Michael talks about hardened criminals and gangs, then veers into a menu of gruel, gruel sandwiches, and gruel omelets, insisting that dessert is 'sometimes more gruel' delivered by 'mean guards' who hate birthdays. The contradictions pile up with every step as he tries to sell a world he clearly only knows from pop culture and half-remembered movie trailers."),
                      content_tag(:p, "The infamous moment arrives when he proclaims that the very worst part of prison was 'the Dementors' - a dead giveaway that his knowledge is borrowed from Harry Potter. The room goes silent. Eyes shift. Someone smirks, someone coughs, and even Michael seems to realize he’s said something unfixable, yet he barrels ahead as though this were privileged information from a maximum-security wizarding wing."),
                      content_tag(:p, "Undeterred, Michael adds threats and warnings that sound like Mad Libs tough-guy talk: no birthday cake, no daylight, cement pillows, and constant danger. He paints the air with big, frightening shapes, then pivots into a lecture about gratitude for fluorescent lights, ergonomic chairs, and the bounty of the vending machine, as if Snickers bars and swivel bases are society’s thin line against chaos."),
                      content_tag(:p, "Jan and Toby try to intervene from the sidelines, steering him toward something resembling a real HR conversation, but Michael only doubles down. He declares this a 'teachable moment,' commands silence with a raised hand, and instructs everyone to thank him for his service as an educator, as though applause could retroactively turn improv into policy."),
                      content_tag(:p, "As the monologue drags on, the laughter fades into a shared, secondhand wince. The comedy comes from Michael’s absolute commitment to a character that cannot survive even the lightest scrutiny - and from his desperate need to be admired as the boss who 'keeps it real.' The camera lingers on faces caught between horror and pity, and every cutaway lands like a sigh.")
                    ])
        end,

      bankruptcy: content_tag(:span, 'I Declare Bankruptcy!', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "As bills stack up and the numbers stop making sense, Michael does what he always does when adulthood becomes overwhelming - he looks for a grand gesture that will make the problem disappear. He imagines a clean slate delivered not by accountants or courts, but by the sheer force of a bold announcement."),
                      content_tag(:p, "Oscar tries to help, carefully explaining what bankruptcy actually is: a legal process, forms, courts, a plan. Michael nods, absorbing none of it, because he has already decided on a solution that feels simpler and much more theatrical, the financial equivalent of cutting a ribbon and calling it a day."),
                      content_tag(:p, "He walks into the bullpen, squares his shoulders like a man about to make history, clears his throat, and bellows at full volume: 'I DECLARE BANKRUPTCY!' The final word echoes against the ceiling tiles as if volume alone could reset his bank account, and he looks around expectantly, awaiting the bureaucratic magic he believes he has just triggered."),
                      content_tag(:p, "Silence follows. A few heads pop up over monitors. Confused looks ripple through the room. Kevin wonders out loud if that’s actually how it works; Creed nods as though he’s tried it in three countries. Michael stands tall, waiting for the visible relief that never arrives - no confetti, no instant credit score bump, just awkward quiet and the hum of the copier."),
                      content_tag(:p, "Oscar pulls him aside again, gently clarifying that bankruptcy is not an incantation. It is paperwork, not pageantry. Michael seems genuinely stunned, as if someone told him that wishing on a star requires a notary, and he repeats the word 'forms' like it’s a personal insult."),
                      content_tag(:p, "Refusing to let the moment die, he pivots to half-baked fixes: whiteboard budgets with arrows and underlines, promises to 'tighten belts,' and a plan that mostly consists of other people making sacrifices. He proposes eliminating 'non-essential' expenditures that suspiciously exclude novelty mugs and a rotating snack budget, none of which addresses the actual math."),
                      content_tag(:p, "Back in his office, he stares at bank statements with the intensity of a person trying to will the numbers into alignment. He whispers 'I declare bankruptcy' one more time under his breath, as if a quieter version might be legally binding, then practices saying it in a more official tone for the camera.")
                    ])
        end,

      cpr_training: content_tag(:span, 'CPR Training', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "After a scare that puts office safety under the microscope, a CPR instructor arrives with a plastic mannequin and a stack of laminated handouts. The room is supposed to be quiet and focused; it never is, because Michael treats 'training' like a stage and 'protocol' like a suggestion."),
                      content_tag(:p, "Within minutes, Michael hijacks the lesson with questions that are neither helpful nor on topic. He is equal parts class clown and self-appointed co-instructor, correcting the professional with confidence born of zero expertise, leaning on phrases like 'best practices' and 'synergy' as though corporate jargon could resuscitate a heartbeat."),
                      content_tag(:p, "When the instructor suggests keeping rhythm to the Bee Gees’ 'Stayin’ Alive,' Michael hears an invitation to perform. He claps, sings too loudly, and turns compressions into choreography. Andy, never one to resist a harmony, joins in until the room resembles a karaoke night held in a first-aid class, with Kevin attempting a bass line and Phyllis swaying like it’s a slow dance."),
                      content_tag(:p, "Dwight, determined to demonstrate 'real' preparedness, starts issuing commands and measuring breaths with militaristic seriousness. His eagerness to escalate quickly outpaces his understanding of what’s appropriate in any setting, let alone a medical one, and he begins inventing scenarios that require handcuffs and a field promotion."),
                      content_tag(:p, "The instructor tries to regain control, but the demonstration has become a Michael Scott production. He monologues about leadership, teamwork, and the importance of morale, somehow managing to miss every actual learning objective while drawing a flowchart that labels 'CPR' as 'Celebrate Positive Resilience.'"),
                      content_tag(:p, "Then comes the unforgettable turn: Dwight produces a knife, slices the face from the mannequin, and wears it like a mask. The room recoils in a synchronized gasp as the instructor’s expression travels from confusion to horror, and Michael declares, inexplicably, that this is 'advanced tactics' they will not be tested on."),
                      content_tag(:p, "By the end, no one can say they learned CPR, though everyone can keep time to 'Stayin’ Alive' and will forever remember what not to do with training equipment. The chaos is so complete it loops back into comedy, a memory that will haunt the break room for months every time the song plays on the radio.")
                    ])
        end
    }
  end
  # rubocop:enable Metrics/MethodLength, Layout/LineLength

  def content_limiter_short_example
    {
      best_boss: content_tag(:span, 'World’s Best Boss', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true }) do
          safe_join([
                      content_tag(:p, "Michael sits proudly at his desk, sipping from his 'World’s Best Boss' mug - a mug he bought for himself at Spencer’s Gifts. He points it out to the documentary crew, insisting that it’s not just a mug, but an irrefutable piece of evidence of his leadership skills."),
                      content_tag(:p, "The cameras meet the Scranton branch: Jim, casually wry; Dwight, rigid and overzealous; Pam, quietly patient at reception; and Ryan, the new temp, still figuring out the terrain. Michael parades the crew through introductions, performing for them as much as managing his team."),
                      content_tag(:p, "News of possible downsizing blows in with Jan from corporate. Michael tries to project calm and control, but he dodges straight answers and leans on bad jokes, more concerned with optics than clarity. The unease trickles through the bullpen.")
                    ])
        end
    }
  end

  def content_limiter_examples_with_max_height(max_height)
    {
      george_foreman: content_tag(:span, 'George Foreman Grill Accident', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true, content_max_height: max_height }) do
          safe_join([
                      content_tag(:p, "Michael explains to the office that every morning he wakes up to the smell of sizzling bacon. His method is both elaborate and ill-advised: he sets a George Foreman Grill at the foot of his bed the night before, lays out strips of bacon, and switches it on so he can rise to the aroma like a king. He frames it as self-care; everyone else hears 'fire hazard.'"),
                      content_tag(:p, "One morning, the fantasy meets physics. Half-asleep, he swings his legs out of bed and plants his bare foot directly onto the hot metal. There is a hiss, a yelp, and a chaotic dance around the bedroom as he tries to untangle himself from the cord. By the time he calls in, the drama has grown from 'burn' to 'catastrophic workplace injury.'"),
                      content_tag(:p, "He arrives at the office limping with exaggerated gravitas, demanding sympathy, rides, and special parking, and comparing his situation to permanent disability. He asks HR about accommodations, requests that meetings be moved closer to his desk, and insists that no one truly understands the daily challenges he now faces."),
                      content_tag(:p, "Pam offers ice and a ride to the clinic, Jim suggests - deadpan - that perhaps bacon should not be cooked in bed, and Dwight prescribes a bizarre regimen of ointments and battlefield procedures. The staff cycle between concern and disbelief as Michael narrates the incident like an inspirational keynote about resilience."),
                      content_tag(:p, "Throughout the day he milks the moment for attention, turning routine tasks into obstacles that require applause when completed. He stages slow, heroic walks through the bullpen, interrupts conversations to retell the story, and peppers in phrases like 'bravery' and 'adversity' as though he has survived a mountaineering accident.")
                    ])
        end,

      prison_mike: content_tag(:span, 'Prison Mike', class: 'title') +
        content_tag(:div, class: 'content gap', data: { content_limiter: true, content_max_height: max_height }) do
          safe_join([
                      content_tag(:p, "When the office staff complain that work feels like prison, Michael decides the only responsible thing to do is educate them - by transforming into a cautionary tale. He frames it as a necessary intervention, the kind of hard truth only a courageous leader can deliver, and you can see the excitement building as he prepares to debut his latest persona."),
                      content_tag(:p, "He strides back in with a purple bandana tied tight, drops his voice into a cartoonish growl, and declares himself 'Prison Mike.' He prowls the floor between desks, demanding attention like a substitute teacher who has watched one too many crime dramas, punctuating every other sentence with dramatic pauses and finger-pointing as if he’s narrating a documentary only he can see."),
                      content_tag(:p, "What follows is a torrent of wildly inconsistent 'facts' about prison life. Michael talks about hardened criminals and gangs, then veers into a menu of gruel, gruel sandwiches, and gruel omelets, insisting that dessert is 'sometimes more gruel' delivered by 'mean guards' who hate birthdays. The contradictions pile up with every step as he tries to sell a world he clearly only knows from pop culture and half-remembered movie trailers."),
                      content_tag(:p, "The infamous moment arrives when he proclaims that the very worst part of prison was 'the Dementors' - a dead giveaway that his knowledge is borrowed from Harry Potter. The room goes silent. Eyes shift. Someone smirks, someone coughs, and even Michael seems to realize he’s said something unfixable, yet he barrels ahead as though this were privileged information from a maximum-security wizarding wing."),
                      content_tag(:p, "Undeterred, Michael adds threats and warnings that sound like Mad Libs tough-guy talk: no birthday cake, no daylight, cement pillows, and constant danger. He paints the air with big, frightening shapes, then pivots into a lecture about gratitude for fluorescent lights, ergonomic chairs, and the bounty of the vending machine, as if Snickers bars and swivel bases are society’s thin line against chaos."),
                      content_tag(:p, "Jan and Toby try to intervene from the sidelines, steering him toward something resembling a real HR conversation, but Michael only doubles down. He declares this a 'teachable moment,' commands silence with a raised hand, and instructs everyone to thank him for his service as an educator, as though applause could retroactively turn improv into policy.")
                    ])
        end
    }
  end

  # Every responsive parity row, keyed by the utility group it exercises. The
  # responsive_test docs page renders these one group at a time; the variant
  # test fixture renders all of them, so both read from one list.
  RESPONSIVE_VARIANT_GROUPS = %w[
    background visibility text flex spacing gap size rounded grid base_layout value label
  ].freeze

  def framework_responsive_variant_row_groups
    RESPONSIVE_VARIANT_GROUPS.index_with { |group| public_send(:"framework_responsive_#{group}_rows") }
  end
end
# rubocop:enable Metrics/ModuleLength
