# Content Limiter

Content areas are capped in height by the view type they sit in. Past that threshold the limiter steps typography down and the Clamp engine truncates the first block that still overflows.

### Basic usage

To enable automatic content limiting, add the `data-content-limiter="true"` attribute to your content element.

Dinner Party

Michael finally manages to trick Jim and Pam into coming over to his condo for a couples’ dinner with him and Jan. He has been begging them for ages, and they finally run out of excuses.

The first thing Michael shows off is his pride and joy: a plasma TV mounted on the living room wall. The problem is that it is laughably tiny, barely larger than a computer monitor. Michael beams with pride as he demonstrates how it can “push right back against the wall” to save space, while Jim and Pam exchange polite smiles that barely conceal their disbelief.

Things take a sharper turn when Jan puts on a CD. The music is recorded by her former assistant, Hunter, and the lyrics make it sound like the two of them were more than just colleagues. Jan sways to the music with a dreamy smile, while Michael tries to ignore the implication. Jim and Pam sit frozen, realizing they have front-row seats to a relationship meltdown.

Dinner itself is no relief. Jan’s cooking is nowhere near ready, so the group is stuck nibbling on appetizers for what feels like hours. When the food does arrive, Jan scolds Michael for trying to eat early, and their bickering turns openly hostile. Andy and Angela, the other guests, sit uncomfortably as the couple jabs at each other across the table. Every sarcastic comment cuts deeper, and the laughter that should fill a dinner party never comes.

Michael, in a desperate attempt to lighten the mood, suggests games. They try charades, but even that devolves into more fighting. Jan mocks Michael’s answers, Michael whines back, and suddenly it feels less like a game and more like another round of public humiliation. The tiny condo seems to shrink with every cutting remark.

It all finally explodes when Jan accuses Michael of being childish and Michael lashes out in return. In her fury, Jan grabs one of his beloved Dundie trophies and hurls it at the plasma TV, shattering it. For Michael, this little TV was his greatest treasure, and now it lies in pieces on the floor. The room falls into stunned silence as everyone realizes the night has gone completely off the rails.

The guests slowly make their exit while Jan and Michael continue to argue in the background. Jim and Pam are relieved just to escape with their sanity intact. What started as a simple dinner party turned into one of the most uncomfortable nights anyone could imagine. For viewers, it is both painful and hilarious, a perfect storm of Michael’s desperate need to impress and Jan’s seething resentment. And right at the center of it all, that ridiculous little plasma TV never stood a chance.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterText Exceeding Threshold

World’s Best Boss

Michael sits proudly at his desk, sipping from his 'World’s Best Boss' mug - a mug he bought for himself at Spencer’s Gifts. He points it out to the documentary crew, insisting that it’s not just a mug, but an irrefutable piece of evidence of his leadership skills.

The cameras meet the Scranton branch: Jim, casually wry; Dwight, rigid and overzealous; Pam, quietly patient at reception; and Ryan, the new temp, still figuring out the terrain. Michael parades the crew through introductions, performing for them as much as managing his team.

News of possible downsizing blows in with Jan from corporate. Michael tries to project calm and control, but he dodges straight answers and leans on bad jokes, more concerned with optics than clarity. The unease trickles through the bullpen.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterText Within Threshold

```
<div class="content" data-content-limiter="true">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>
```

When content exceeds the height threshold, the limiter adds the `content--small` class and automatically truncates the first overflowing block using the Clamp Engine [Clamp](/framework/docs/2.3/clamp) so it fits the remaining space. Subsequent blocks are hidden.

### Custom Height Threshold

You can specify a custom maximum height using the `data-content-max-height` attribute.

George Foreman Grill Accident

Michael explains to the office that every morning he wakes up to the smell of sizzling bacon. His method is both elaborate and ill-advised: he sets a George Foreman Grill at the foot of his bed the night before, lays out strips of bacon, and switches it on so he can rise to the aroma like a king. He frames it as self-care; everyone else hears 'fire hazard.'

One morning, the fantasy meets physics. Half-asleep, he swings his legs out of bed and plants his bare foot directly onto the hot metal. There is a hiss, a yelp, and a chaotic dance around the bedroom as he tries to untangle himself from the cord. By the time he calls in, the drama has grown from 'burn' to 'catastrophic workplace injury.'

He arrives at the office limping with exaggerated gravitas, demanding sympathy, rides, and special parking, and comparing his situation to permanent disability. He asks HR about accommodations, requests that meetings be moved closer to his desk, and insists that no one truly understands the daily challenges he now faces.

Pam offers ice and a ride to the clinic, Jim suggests - deadpan - that perhaps bacon should not be cooked in bed, and Dwight prescribes a bizarre regimen of ointments and battlefield procedures. The staff cycle between concern and disbelief as Michael narrates the incident like an inspirational keynote about resilience.

Throughout the day he milks the moment for attention, turning routine tasks into obstacles that require applause when completed. He stages slow, heroic walks through the bullpen, interrupts conversations to retell the story, and peppers in phrases like 'bravery' and 'adversity' as though he has survived a mountaineering accident.

Prison Mike

When the office staff complain that work feels like prison, Michael decides the only responsible thing to do is educate them - by transforming into a cautionary tale. He frames it as a necessary intervention, the kind of hard truth only a courageous leader can deliver, and you can see the excitement building as he prepares to debut his latest persona.

He strides back in with a purple bandana tied tight, drops his voice into a cartoonish growl, and declares himself 'Prison Mike.' He prowls the floor between desks, demanding attention like a substitute teacher who has watched one too many crime dramas, punctuating every other sentence with dramatic pauses and finger-pointing as if he’s narrating a documentary only he can see.

What follows is a torrent of wildly inconsistent 'facts' about prison life. Michael talks about hardened criminals and gangs, then veers into a menu of gruel, gruel sandwiches, and gruel omelets, insisting that dessert is 'sometimes more gruel' delivered by 'mean guards' who hate birthdays. The contradictions pile up with every step as he tries to sell a world he clearly only knows from pop culture and half-remembered movie trailers.

The infamous moment arrives when he proclaims that the very worst part of prison was 'the Dementors' - a dead giveaway that his knowledge is borrowed from Harry Potter. The room goes silent. Eyes shift. Someone smirks, someone coughs, and even Michael seems to realize he’s said something unfixable, yet he barrels ahead as though this were privileged information from a maximum-security wizarding wing.

Undeterred, Michael adds threats and warnings that sound like Mad Libs tough-guy talk: no birthday cake, no daylight, cement pillows, and constant danger. He paints the air with big, frightening shapes, then pivots into a lecture about gratitude for fluorescent lights, ergonomic chairs, and the bounty of the vending machine, as if Snickers bars and swivel bases are society’s thin line against chaos.

Jan and Toby try to intervene from the sidelines, steering him toward something resembling a real HR conversation, but Michael only doubles down. He declares this a 'teachable moment,' commands silence with a raised hand, and instructs everyone to thank him for his service as an educator, as though applause could retroactively turn improv into policy.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterCustom Max Height: 140px

```
<div class="content" data-content-limiter="true" data-content-max-height="140">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>

<div class="content" data-content-limiter="true" data-content-max-height="140">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>
```

### Mashup Example

This demonstrates content limiting within a multi‑view mashup.

CPR Training

After a scare that puts office safety under the microscope, a CPR instructor arrives with a plastic mannequin and a stack of laminated handouts. The room is supposed to be quiet and focused; it never is, because Michael treats 'training' like a stage and 'protocol' like a suggestion.

Within minutes, Michael hijacks the lesson with questions that are neither helpful nor on topic. He is equal parts class clown and self-appointed co-instructor, correcting the professional with confidence born of zero expertise, leaning on phrases like 'best practices' and 'synergy' as though corporate jargon could resuscitate a heartbeat.

When the instructor suggests keeping rhythm to the Bee Gees’ 'Stayin’ Alive,' Michael hears an invitation to perform. He claps, sings too loudly, and turns compressions into choreography. Andy, never one to resist a harmony, joins in until the room resembles a karaoke night held in a first-aid class, with Kevin attempting a bass line and Phyllis swaying like it’s a slow dance.

Dwight, determined to demonstrate 'real' preparedness, starts issuing commands and measuring breaths with militaristic seriousness. His eagerness to escalate quickly outpaces his understanding of what’s appropriate in any setting, let alone a medical one, and he begins inventing scenarios that require handcuffs and a field promotion.

The instructor tries to regain control, but the demonstration has become a Michael Scott production. He monologues about leadership, teamwork, and the importance of morale, somehow managing to miss every actual learning objective while drawing a flowchart that labels 'CPR' as 'Celebrate Positive Resilience.'

Then comes the unforgettable turn: Dwight produces a knife, slices the face from the mannequin, and wears it like a mask. The room recoils in a synchronized gasp as the instructor’s expression travels from confusion to horror, and Michael declares, inexplicably, that this is 'advanced tactics' they will not be tested on.

By the end, no one can say they learned CPR, though everyone can keep time to 'Stayin’ Alive' and will forever remember what not to do with training equipment. The chaos is so complete it loops back into comedy, a memory that will haunt the break room for months every time the song plays on the radio.

I Declare Bankruptcy!

As bills stack up and the numbers stop making sense, Michael does what he always does when adulthood becomes overwhelming - he looks for a grand gesture that will make the problem disappear. He imagines a clean slate delivered not by accountants or courts, but by the sheer force of a bold announcement.

Oscar tries to help, carefully explaining what bankruptcy actually is: a legal process, forms, courts, a plan. Michael nods, absorbing none of it, because he has already decided on a solution that feels simpler and much more theatrical, the financial equivalent of cutting a ribbon and calling it a day.

He walks into the bullpen, squares his shoulders like a man about to make history, clears his throat, and bellows at full volume: 'I DECLARE BANKRUPTCY!' The final word echoes against the ceiling tiles as if volume alone could reset his bank account, and he looks around expectantly, awaiting the bureaucratic magic he believes he has just triggered.

Silence follows. A few heads pop up over monitors. Confused looks ripple through the room. Kevin wonders out loud if that’s actually how it works; Creed nods as though he’s tried it in three countries. Michael stands tall, waiting for the visible relief that never arrives - no confetti, no instant credit score bump, just awkward quiet and the hum of the copier.

Oscar pulls him aside again, gently clarifying that bankruptcy is not an incantation. It is paperwork, not pageantry. Michael seems genuinely stunned, as if someone told him that wishing on a star requires a notary, and he repeats the word 'forms' like it’s a personal insult.

Refusing to let the moment die, he pivots to half-baked fixes: whiteboard budgets with arrows and underlines, promises to 'tighten belts,' and a plan that mostly consists of other people making sacrifices. He proposes eliminating 'non-essential' expenditures that suspiciously exclude novelty mugs and a rotating snack budget, none of which addresses the actual math.

Back in his office, he stares at bank statements with the intensity of a person trying to will the numbers into alignment. He whispers 'I declare bankruptcy' one more time under his breath, as if a quieter version might be legally binding, then practices saying it in a more official tone for the camera.

Scott’s Tots

Michael proudly struts into a high school classroom filled with expectant seniors, all of whom have been promised by him years earlier that he would pay for their college tuition. The moment is set up like a triumphant return; the students cheer and clap as Michael enters, and for a fleeting second, he basks in the illusion of being a hero. Their excitement is palpable, with handmade signs and chants of 'Thank you, Mr. Scott!' ringing in his ears.

But underneath Michael’s forced smile lies sheer panic. As he begins his speech, his voice quivers ever so slightly, betraying his nerves. He tries to stretch out his introduction with jokes and awkward pauses, desperately searching for a way to soften the devastating truth he has to deliver. The students, however, hang on his every word, their faces glowing with hope and admiration for the man they believe has single-handedly secured their futures.

When the truth finally comes out - that Michael does not, in fact, have the money to pay for their tuition - the atmosphere in the room collapses instantly. Gasps and groans replace the cheers, and disbelief spreads across the room like a wave. Michael attempts to salvage the moment by offering to pay for everyone’s laptop batteries, a pathetic gesture that only highlights the absurdity of his promise. The crushing disappointment on the students’ faces makes the scene almost unbearable to watch.

The pain of the moment is amplified by how sincerely Michael believed in his original promise. Years earlier, he had genuinely thought he would become wealthy enough to follow through, blinded by his own optimism and detachment from reality. Now, forced to confront the impossibility of his pledge, he tries to laugh it off and hide behind humor, but the room is heavy with betrayal and crushed dreams.

As the students press him with questions and accusations, Michael becomes visibly smaller, almost shrinking into himself. His usual bravado evaporates as he stammers and dodges eye contact. The power dynamic has shifted completely - no longer the adored benefactor, he is now the object of ridicule and anger. The laughter in this scene comes not from jokes, but from the unbearable awkwardness of Michael’s failed attempt to maintain dignity in an impossible situation.

What makes 'Scott’s Tots' legendary is the raw, secondhand embarrassment it evokes. Viewers squirm in discomfort as Michael struggles, yet it is impossible to look away. It’s a perfect example of how The Office blends comedy and tragedy, creating a scene so painful that it loops back around into being hilarious. The genius lies in how Michael’s delusions of grandeur are shattered not with slapstick, but with the crushing weight of reality.

By the time Michael leaves the classroom, he is utterly defeated, his reputation destroyed in front of dozens of hopeful young people. For the students, it’s the death of a dream. For Michael, it’s yet another reminder of how his desperate need to be loved and admired leads him into catastrophic decisions. And for the audience, it’s a masterclass in cringe comedy, one of the most excruciating yet unforgettable moments in television history.

 Previous  [ 

## Fit Value

Automatically resize numbers and values to fit within their containers

 ](/framework/docs/2.3/fit_value)

 Next  [ 

## Pixel Perfect

Ensure text renders with crisp edges by aligning to the pixel grid

 ](/framework/docs/2.3/pixel_perfect)

