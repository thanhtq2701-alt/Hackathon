(function (root) {
const CARDS = {
      environment: [
        {
          title: "The Arctic Drill",
          body: "Massive oil reserves are found in a protected tundra. Your party wants the revenue.",
          choices: [
            {
              text: "Full Extraction \u2014 Drill everything to boost the economy.",
              outcome: "Economy rises, but the public is disappointed.",
              eco: 6,
              approval: -7,
              party: 3,
              empathy: -6,
              integrity: -7,
              ideology: 5,
              courage: 4,
              energy: 5
            },
            {
              text: "Eco-Tourism \u2014 Turn it into a park to boost approval.",
              outcome: "Approval rises, but the Party loses donors.",
              approval: 5,
              party: -7,
              eco: -3,
              empathy: 7,
              integrity: 4,
              ideology: -5,
              courage: -3,
              energy: -3
            },
            {
              text: "Lease to Allies \u2014 Let a friendly nation drill for a fee.",
              outcome: "Economy drops, but Tension rises with rivals.",
              eco: 6,
              tension: 3,
              party: 2,
              empathy: -2,
              integrity: -3,
              ideology: 3,
              courage: 2,
              energy: 2
            },
            {
              text: "Ban Activity \u2014 Leave it untouched for the future.",
              outcome: "Integrity is high, but the Economy suffers.",
              integrity: 7,
              eco: -2,
              approval: 2,
              party: -5,
              empathy: 5,
              ideology: -6,
              courage: 6,
              energy: 0
            }
          ]
        },
        {
          title: "Rolling Blackouts",
          body: "Green energy isn't meeting demand. The capital is dark.",
          choices: [
            {
              text: "Restart Coal \u2014 Turn the old plants back on now.",
              outcome: "Power returns, but people\u2019 health drops.",
              eco: 4,
              approval: -5,
              party: 2,
              empathy: -5,
              integrity: -6,
              ideology: 4,
              courage: 3,
              energy: 5
            },
            {
              text: "Ration Power \u2014 Limit electricity to homes.",
              outcome: "Authority rises, but Approval takes a hit.",
              unrest: 7,
              approval: -7,
              party: -2,
              empathy: -4,
              integrity: 3,
              ideology: 7,
              courage: 5,
              energy: -4
            },
            {
              text: "Import Power \u2014 Buy nuclear energy from a rival.",
              outcome: "Economy rises, but tension with rivals decreases.",
              tension: -3,
              eco: -7,
              party: 2,
              empathy: 2,
              integrity: 2,
              ideology: -3,
              courage: -4,
              energy: 3
            },
            {
              text: "Emergency Fund \u2014 Spend on fast-build solar.",
              outcome: "The future is green, but the Treasury is low.",
              eco: -7,
              approval: 6,
              integrity: 7,
              party: 2,
              empathy: 6,
              ideology: -5,
              courage: 4,
              energy: -8
            }
          ]
        },
        {
          title: "The Great Drought",
          body: "Water levels are at 5%. Farmers and Cities are fighting.",
          choices: [
            {
              text: "Prioritize Cities \u2014 Keep the people hydrated.",
              outcome: "Approval stays stable, but the Economy dips.",
              approval: 6,
              eco: -7,
              party: -2,
              empathy: 5,
              integrity: 2,
              ideology: -3,
              courage: 3,
              energy: -5
            },
            {
              text: "Prioritize Farms \u2014 Save the food supply.",
              outcome: "Food is safe, but the public is frustrated.",
              eco: 7,
              approval: -7,
              unrest: 2,
              empathy: -3,
              integrity: 4,
              ideology: 4,
              courage: 4,
              energy: -2
            },
            {
              text: "Water Tax \u2014 Make it expensive to limit use.",
              outcome: "Economy drops, but Party loyalty vanishes.",
              eco: 5,
              approval: -8,
              party: -7,
              empathy: -7,
              integrity: -4,
              ideology: 6,
              courage: 2,
              energy: 0
            },
            {
              text: "The Pipeline \u2014 Seize water from neighbors.",
              outcome: "The pipes are full, but War Tension is high.",
              tension: 8,
              unrest: 4,
              approval: -2,
              empathy: -5,
              integrity: -7,
              ideology: 7,
              courage: 7,
              energy: -8
            }
          ]
        },
        {
          title: "The Old Coal Mines",
          body: "Abandoned mines are leaking toxic gas into nearby towns.",
          choices: [
            {
              text: "Seal & Bury \u2014 Quick and cheap fix.",
              outcome: "Saves money, but the gas will leak eventually.",
              eco: 4,
              approval: -6,
              party: 2,
              empathy: -7,
              integrity: -7,
              ideology: 3,
              courage: -2,
              energy: 4
            },
            {
              text: "Total Cleanup \u2014 Spend to neutralize toxins.",
              outcome: "People love you, but the Treasury is bleeding.",
              approval: 7,
              eco: -8,
              integrity: 7,
              empathy: 7,
              ideology: -4,
              courage: 3,
              energy: -2
            },
            {
              text: "Evacuate \u2014 Move the citizens; test weapons.",
              outcome: "Military control grows; the town is a ghost.",
              unrest: 7,
              approval: -7,
              tension: 3,
              empathy: -3,
              integrity: -2,
              ideology: 7,
              courage: 6,
              energy: -1
            },
            {
              text: "Deny Liability \u2014 Claim it's a private problem.",
              outcome: "The Party is safe; the public is ignored.",
              party: 6,
              approval: -8,
              integrity: -8,
              empathy: -7,
              ideology: 4,
              courage: -5,
              energy: 0
            }
          ]
        },
        {
          title: "The Plastic Tide",
          body: "A massive \"island\" of trash is drifting toward a rival's coast.",
          choices: [
            {
              text: "Ignore It \u2014 Let the currents handle it.",
              outcome: "Free, but International Tension rises.",
              tension: 8,
              eco: 2,
              approval: -3,
              empathy: -6,
              integrity: -5,
              ideology: 2,
              courage: -6,
              energy: -3
            },
            {
              text: "Pay a Ransom \u2014 Pay the rival to clean it.",
              outcome: "Tension drops, but the Economy spikes.",
              tension: -7,
              eco: -7,
              party: -2,
              empathy: 3,
              integrity: 2,
              ideology: -3,
              courage: -4,
              energy: -5
            },
            {
              text: "Naval Cleanup \u2014 Deploy the fleet to scoop it.",
              outcome: "Authority rises; the soldiers hate the duty.",
              unrest: 4,
              tension: -3,
              party: -5,
              empathy: 2,
              integrity: 5,
              ideology: 6,
              courage: 5,
              energy: -1
            },
            {
              text: "Burn It \u2014 Set the trash pile on fire at sea.",
              outcome: "Trash is gone, but the smoke is a scandal.",
              tension: 7,
              approval: -7,
              integrity: -7,
              empathy: -7,
              ideology: 4,
              courage: 4,
              energy: 0
            }
          ]
        },
        {
          title: "The Rare Mineral",
          body: "Tech giants need Cobalt under a sacred mountain.",
          choices: [
            {
              text: "Demolish \u2014 Tech boom needs the Cobalt.",
              outcome: "Economy thrives; a landmark is erased.",
              eco: 8,
              approval: -7,
              integrity: -7,
              empathy: -7,
              ideology: 7,
              courage: 5,
              energy: 4
            },
            {
              text: "Consult \u2014 Offer the tribe 1% profit.",
              outcome: "The tribe refuses; the Party is annoyed.",
              eco: 3,
              party: -7,
              approval: -2,
              empathy: 4,
              integrity: 3,
              ideology: -2,
              courage: -3,
              energy: -4
            },
            {
              text: "Sanctuary \u2014 Ban mining to protect the site.",
              outcome: "Integrity is high; industry stalls.",
              integrity: 7,
              eco: -7,
              approval: 4,
              empathy: 7,
              ideology: -6,
              courage: 4,
              energy: 0
            },
            {
              text: "Subsidize \u2014 Pay firms to find alternatives.",
              outcome: "The search for a substitute costs billions.",
              eco: -7,
              integrity: 5,
              party: 2,
              empathy: 3,
              ideology: -2,
              courage: -2,
              energy: -2
            }
          ]
        },
        {
          title: "Deep Sea Drilling",
          body: "Scientists warn of a fault line near a new oil rig.",
          choices: [
            {
              text: "Drill Anyway \u2014 We need fuel security.",
              outcome: "Economic boost; an earthquake is possible.",
              eco: 7,
              approval: -4,
              integrity: -7,
              empathy: -7,
              ideology: 4,
              courage: 7,
              energy: 5
            },
            {
              text: "Safety First \u2014 Halt the rig for a study.",
              outcome: "Public feels safe; Party donors are furious.",
              approval: 6,
              party: -7,
              eco: -4,
              empathy: 6,
              integrity: 7,
              ideology: -4,
              courage: -5,
              energy: -5
            },
            {
              text: "Automate \u2014 Use drones to \"protect\" life.",
              outcome: "High tech, high cost; Authority grows.",
              unrest: 5,
              eco: -6,
              integrity: 3,
              empathy: -4,
              ideology: 6,
              courage: 4,
              energy: 1
            },
            {
              text: "Sell the Rights \u2014 Let a foreign firm take risk.",
              outcome: "Tension rises as rivals enter your waters.",
              tension: 7,
              eco: 3,
              party: 2,
              empathy: -3,
              integrity: -5,
              ideology: 3,
              courage: -2,
              energy: -2
            }
          ]
        },
        {
          title: "The Smog Crisis",
          body: "Factories are causing a \"Red Alert\" in the capital.",
          choices: [
            {
              text: "Shut Them Down \u2014 Order a 3-day closure.",
              outcome: "Air clears; the Economy takes a hit.",
              approval: 7,
              eco: -7,
              party: -3,
              empathy: 7,
              integrity: 6,
              ideology: -5,
              courage: 7,
              energy: -5
            },
            {
              text: "Issue Masks \u2014 Tell the public to buy masks.",
              outcome: "Saves economy; the Public is suffocating.",
              eco: 5,
              approval: -8,
              empathy: -7,
              integrity: -7,
              ideology: 2,
              courage: -4,
              energy: -2
            },
            {
              text: "Clean Filters \u2014 Mandate expensive filters.",
              outcome: "Industry complains; the Party turns.",
              unrest: 7,
              party: -7,
              eco: -2,
              empathy: 3,
              integrity: 5,
              ideology: 6,
              courage: 3,
              energy: 0
            },
            {
              text: "Relocate \u2014 Move factories to the border.",
              outcome: "Air is clean; International Tension spikes.",
              tension: 7,
              approval: 3,
              eco: -3,
              empathy: -4,
              integrity: -5,
              ideology: 5,
              courage: 2,
              energy: -3
            }
          ]
        },
        {
          title: "The Endangered Bird",
          body: "A tiny bird is nesting on a vital new dam site.",
          choices: [
            {
              text: "Flood the Nest \u2014 The city needs hydro-power.",
              outcome: "Energy is cheap; the bird is gone.",
              eco: 7,
              integrity: -7,
              approval: -3,
              empathy: -7,
              ideology: 4,
              courage: 2,
              energy: 0
            },
            {
              text: "Relocate Bird \u2014 Spend $50M to move nests.",
              outcome: "Public is amused; the Treasury is annoyed.",
              approval: 4,
              eco: -5,
              party: -2,
              empathy: 6,
              integrity: 4,
              ideology: -2,
              courage: -2,
              energy: -2
            },
            {
              text: "Scrap the Dam \u2014 Find a different power source.",
              outcome: "Integrity is high; economy stays weak.",
              integrity: 7,
              eco: -7,
              approval: 3,
              empathy: 7,
              ideology: -5,
              courage: 4,
              energy: -1
            },
            {
              text: "Build Around \u2014 Modify the dam; less efficient.",
              outcome: "Satisfies no one; costs more for less.",
              eco: -7,
              approval: -2,
              party: -3,
              empathy: 4,
              integrity: 5,
              ideology: -1,
              courage: -1,
              energy: -3
            }
          ]
        },
        {
          title: "The Carbon Tax",
          body: "Experts say a car tax will save the planet.",
          choices: [
            {
              text: "Pass the Tax \u2014 Punish polluters immediately.",
              outcome: "Integrity rises; Public hates high costs.",
              integrity: 7,
              approval: -7,
              eco: 2,
              empathy: 4,
              ideology: 5,
              courage: 6,
              energy: 2
            },
            {
              text: "Exempt Industry \u2014 Tax people, not companies.",
              outcome: "Party is happy; people are in streets.",
              party: 6,
              approval: -8,
              integrity: -7,
              empathy: -7,
              ideology: 6,
              courage: -3,
              energy: -6
            },
            {
              text: "Veto the Tax \u2014 Defend \"freedom\" of the road.",
              outcome: "Economy is stable; Tension with allies.",
              eco: 3,
              tension: 5,
              approval: 2,
              empathy: -4,
              integrity: -2,
              ideology: -5,
              courage: -4,
              energy: 0
            },
            {
              text: "Incentivize \u2014 Give a tax break for EVs.",
              outcome: "Green future, but the Economy rises.",
              eco: -7,
              approval: 6,
              integrity: 6,
              empathy: 6,
              ideology: -3,
              courage: 2,
              energy: -1
            }
          ]
        },
        {
          title: "The GMO Harvest",
          body: "A \"Super-Grain\" grows in heat but kills bees.",
          choices: [
            {
              text: "Sow the Seeds \u2014 End the food shortage now.",
              outcome: "Economy rises; environment is at risk.",
              eco: 7,
              approval: -7,
              party: -4,
              empathy: -7,
              integrity: -7,
              ideology: 5,
              courage: 6,
              energy: -2
            },
            {
              text: "Lab Testing \u2014 Delay harvest for 3 years.",
              outcome: "Safety first; people are hungry and angry.",
              approval: -7,
              eco: -3,
              party: -4,
              empathy: 6,
              integrity: 7,
              ideology: -4,
              courage: -5,
              energy: 0
            },
            {
              text: "Destroy \u2014 Burn seeds to protect ecosystem.",
              outcome: "Integrity is high; Economy takes a hit.",
              integrity: 7,
              eco: -7,
              approval: 2,
              empathy: 7,
              ideology: -5,
              courage: 4,
              energy: -1
            },
            {
              text: "Export \u2014 Sell seeds to a starving rival.",
              outcome: "Economy falls; Tension rises as they feel tricked.",
              eco: 6,
              tension: 7,
              party: 2,
              empathy: -6,
              integrity: -7,
              ideology: 6,
              courage: 3,
              energy: 1
            }
          ]
        },
        {
          title: "Nuclear Waste",
          body: "Where should we put the spent fuel rods?",
          choices: [
            {
              text: "The Border \u2014 Bury them near a rival's line.",
              outcome: "Authority rises; Tension reaches red.",
              unrest: 6,
              tension: 8,
              eco: 2,
              empathy: -7,
              integrity: -7,
              ideology: 7,
              courage: 7,
              energy: -4
            },
            {
              text: "Deep Sea \u2014 Drop them into the abyss.",
              outcome: "Invisible problem; Public finds out later.",
              eco: 3,
              approval: -7,
              party: -2,
              empathy: -7,
              integrity: -7,
              ideology: 2,
              courage: -5,
              energy: -8
            },
            {
              text: "Under the City \u2014 Use for district heating.",
              outcome: "Efficient heat; Approval drops as panic starts.",
              eco: 6,
              approval: -9,
              integrity: -6,
              empathy: -4,
              ideology: 4,
              courage: 7,
              energy: 0
            },
            {
              text: "Space Launch \u2014 Shoot the waste into the Sun.",
              outcome: "Ultimate solution; the Economy is staggering.",
              eco: -9,
              integrity: 7,
              approval: 3,
              empathy: 5,
              ideology: -3,
              courage: 7,
              energy: -2
            }
          ]
        },
        {
          title: "The Forest Fire",
          body: "A fire is heading toward an elite resort.",
          choices: [
            {
              text: "Save Resort \u2014 Protect the Party donors' assets.",
              outcome: "Party loyalty rises; Public feels ignored.",
              party: 7,
              approval: -8,
              empathy: -7,
              integrity: -8,
              ideology: 7,
              courage: -2,
              energy: -6
            },
            {
              text: "Save Towns \u2014 Protect the citizens' homes.",
              outcome: "Public is grateful; the Party is furious.",
              approval: 7,
              party: -7,
              eco: -2,
              empathy: 8,
              integrity: 7,
              ideology: -6,
              courage: 5,
              energy: -3
            },
            {
              text: "Let it Burn \u2014 It\u2019s a natural renewal process.",
              outcome: "Nature wins; everyone thinks you're mad.",
              approval: -9,
              party: -5,
              integrity: 6,
              empathy: -2,
              ideology: -7,
              courage: -6,
              energy: 0
            },
            {
              text: "Sacrifice Park \u2014 Burn a break through the forest.",
              outcome: "Buildings are safe; wildlife is lost.",
              eco: -6,
              approval: -4,
              party: 3,
              empathy: -6,
              integrity: -5,
              ideology: 4,
              courage: 4,
              energy: -1
            }
          ]
        },
        {
          title: "The Hunting Ban",
          body: "A majestic elk is nearly extinct. Party loves hunting.",
          choices: [
            {
              text: "Total Ban \u2014 Arrest anyone who shoots one.",
              outcome: "Integrity rises; Party elites feel insulted.",
              integrity: 7,
              party: -7,
              approval: 3,
              empathy: 7,
              ideology: -5,
              courage: 6,
              energy: -2
            },
            {
              text: "Licensing \u2014 Charge $100k per elk to hunt.",
              outcome: "Economy rises; Public sees corruption.",
              eco: 6,
              approval: -7,
              party: 2,
              empathy: -7,
              integrity: -7,
              ideology: 4,
              courage: -3,
              energy: 0
            },
            {
              text: "Public Shoot \u2014 Organize a hunt to show power.",
              outcome: "Authority rises; International community gasps.",
              unrest: 7,
              tension: 7,
              approval: -6,
              empathy: -7,
              integrity: -8,
              ideology: 7,
              courage: 7,
              energy: -1
            },
            {
              text: "Cloning \u2014 Spend billions to replace them.",
              outcome: "Future-proof; the Treasury is empty.",
              eco: -7,
              integrity: 5,
              approval: 2,
              empathy: 6,
              ideology: -2,
              courage: 2,
              energy: -4
            }
          ]
        },
        {
          title: "The Green Wall",
          body: "Plant 1 billion trees to stop the desert.",
          choices: [
            {
              text: "Full Project \u2014 Use the military to plant them.",
              outcome: "Authority rises; the Economy is high.",
              unrest: 6,
              eco: -9,
              approval: 5,
              empathy: 4,
              integrity: 6,
              ideology: 7,
              courage: 7,
              energy: -5
            },
            {
              text: "Volunteer \u2014 Ask people to do it for free.",
              outcome: "Approval rises; but few trees are planted.",
              approval: 4,
              eco: -1,
              party: -2,
              empathy: 5,
              integrity: 3,
              ideology: -4,
              courage: -3,
              energy: -2
            },
            {
              text: "Fake It \u2014 Paint the desert green for photos.",
              outcome: "Party is happy; the scandal is coming.",
              party: 7,
              integrity: -8,
              approval: -5,
              empathy: -7,
              ideology: 5,
              courage: 2,
              energy: 0
            },
            {
              text: "Reject \u2014 We need the land for mining.",
              outcome: "Economy rises; sandstorms hit the city.",
              eco: 7,
              approval: -7,
              tension: 3,
              empathy: -6,
              integrity: -7,
              ideology: 6,
              courage: 4,
              energy: -8
            }
          ]
        },
        {
          title: "Solar Spill",
          body: "A solar mirror cracked and is melting a road.",
          choices: [
            {
              text: "Military Repair \u2014 Send the Guard to fix it.",
              outcome: "Authority rises; the soldiers are hot.",
              unrest: 6,
              eco: -3,
              approval: 2,
              empathy: -3,
              integrity: 4,
              ideology: 7,
              courage: 5,
              energy: -4
            },
            {
              text: "Abandon \u2014 Let it melt; road wasn't vital.",
              outcome: "Saves money; Public is stuck in traffic.",
              eco: 2,
              approval: -7,
              party: -3,
              empathy: -6,
              integrity: -5,
              ideology: -3,
              courage: -5,
              energy: -7
            },
            {
              text: "Tax Industry \u2014 Make the solar company pay.",
              outcome: "Integrity rises; Party donors are angry.",
              integrity: 7,
              party: -7,
              eco: 2,
              empathy: 4,
              ideology: -4,
              courage: 4,
              energy: -2
            },
            {
              text: "Pave Over \u2014 Pour concrete over mirrors.",
              outcome: "Fast fix; the damage is permanent.",
              eco: -4,
              integrity: -7,
              approval: -2,
              empathy: -5,
              ideology: 3,
              courage: 2,
              energy: 4
            }
          ]
        },
        {
          title: "The Whale Song",
          body: "A rare whale blocks a shipping lane.",
          choices: [
            {
              text: "Sonar Blast \u2014 Clear the lane by force.",
              outcome: "Economy is high; whales are deafened.",
              eco: 4,
              integrity: -7,
              approval: -5,
              empathy: -7,
              ideology: 6,
              courage: 3,
              energy: 0
            },
            {
              text: "Reroute Ships \u2014 Add 3 days to trade trips.",
              outcome: "Integrity rises; economy takes a hit.",
              integrity: 7,
              eco: -7,
              approval: 3,
              empathy: 7,
              ideology: -5,
              courage: 4,
              energy: 0
            },
            {
              text: "Study Them \u2014 Send scientists to \"talk.\"",
              outcome: "Approval rises; Trade Union is on strike.",
              approval: 5,
              eco: -6,
              party: -4,
              empathy: 7,
              integrity: 4,
              ideology: -3,
              courage: -2,
              energy: -3
            },
            {
              text: "Invite Rival \u2014 Let a rival nation handle it.",
              outcome: "Tension rises as they move warships in.",
              tension: 8,
              eco: 2,
              unrest: -3,
              empathy: -4,
              integrity: -6,
              ideology: 4,
              courage: -3,
              energy: -1
            }
          ]
        },
        {
          title: "The Sky Seeders",
          body: "Spray chemicals to cool the planet.",
          choices: [
            {
              text: "Spray Now \u2014 Lead the world in climate tech.",
              outcome: "Tension rises; neighbors fear weather wars.",
              tension: 8,
              unrest: 5,
              approval: -4,
              empathy: -5,
              integrity: -7,
              ideology: 7,
              courage: 7,
              energy: -8
            },
            {
              text: "Ban Aerosols \u2014 Too dangerous to play God.",
              outcome: "Safety first; heatwaves get worse.",
              approval: -7,
              tension: -4,
              eco: -2,
              empathy: 4,
              integrity: 6,
              ideology: -4,
              courage: -5,
              energy: 0
            },
            {
              text: "Small Trial \u2014 Only spray over the Capital.",
              outcome: "The public is cool; the rest of the nation burns.",
              unrest: 7,
              approval: -7,
              party: -2,
              empathy: -7,
              integrity: -6,
              ideology: 6,
              courage: 4,
              energy: -2
            },
            {
              text: "Sell Tech \u2014 Sell the chemicals to an ally.",
              outcome: "Economy falls; allies control the rain.",
              eco: 7,
              tension: 6,
              integrity: -7,
              empathy: -7,
              ideology: 5,
              courage: 5,
              energy: -4
            }
          ]
        },
        {
          title: "Deep Sea Mining",
          body: "Minerals for phones are found in a reef.",
          choices: [
            {
              text: "Strip Mine \u2014 Industry needs the hardware.",
              outcome: "Economy rises; the reef is destroyed.",
              eco: 7,
              integrity: -7,
              approval: -4,
              empathy: -7,
              ideology: 7,
              courage: 6,
              energy: 4
            },
            {
              text: "Robot Harvest \u2014 High cost, less damage.",
              outcome: "Economy rises; technology is secured.",
              eco: -6,
              party: 2,
              integrity: 6,
              empathy: 5,
              ideology: -2,
              courage: 4,
              energy: -4
            },
            {
              text: "Ban Mining \u2014 Protect the ocean life.",
              outcome: "Integrity rises; technology is expensive.",
              integrity: 7,
              eco: -7,
              approval: 3,
              empathy: 7,
              ideology: -6,
              courage: 2,
              energy: 0
            },
            {
              text: "Lease Reef \u2014 Let another nation mine it.",
              outcome: "Tension rises; rivals move into the reef.",
              tension: 7,
              eco: 4,
              party: -3,
              empathy: -4,
              integrity: -6,
              ideology: 3,
              courage: 2,
              energy: 1
            }
          ]
        },
        {
          title: "Acid Rain",
          body: "Industry pollution is melting statues in the city.",
          choices: [
            {
              text: "Scrubbers \u2014 Mandate expensive air filters.",
              outcome: "Approval rises; Party donors are angry.",
              approval: 6,
              party: -7,
              eco: -2,
              empathy: 7,
              integrity: 7,
              ideology: -3,
              courage: 4,
              energy: -6
            },
            {
              text: "Acid Shield \u2014 Spray protective wax on the city.",
              outcome: "Authority rises; statues are sticky.",
              unrest: 5,
              approval: 2,
              eco: -4,
              empathy: -3,
              integrity: -2,
              ideology: 5,
              courage: 2,
              energy: -3
            },
            {
              text: "Ignore \u2014 Let the statues melt; fix the Economy.",
              outcome: "Economy is fine; Approval hits zero.",
              eco: 4,
              approval: -7,
              integrity: -7,
              empathy: -7,
              ideology: 4,
              courage: -5,
              energy: 0
            },
            {
              text: "Subsidize \u2014 Pay factories to move.",
              outcome: "Party is happy; Treasury is empty.",
              party: 5,
              eco: -8,
              approval: 2,
              empathy: 4,
              integrity: 5,
              ideology: -2,
              courage: -3,
              energy: -5
            }
          ]
        }
      ],
      economy: [
        {
          title: "The Central Bank Interest",
          body: "Inflation is rising. The Central Bank wants to hike interest rates to save the currency.",
          choices: [
            {
              text: "Allow Hike \u2014 Stop inflation now.",
              outcome: "Economy stabilizes, but the Public is angry about high mortgage costs.",
              eco: 7,
              approval: -7,
              party: 3,
              empathy: -4,
              integrity: 6,
              ideology: 3,
              courage: 5,
              energy: -5
            },
            {
              text: "Freeze Rates \u2014 Keep borrowing cheap for the people.",
              outcome: "Approval rises, but the Economy begins to overheat dangerously.",
              approval: 7,
              eco: -8,
              tension: 2,
              empathy: 6,
              integrity: -5,
              ideology: -4,
              courage: -3,
              energy: -3
            },
            {
              text: "Subsidize Loans \u2014 Raise rates but pay the difference for citizens.",
              outcome: "Everyone is happy, but the National Economy spikes.",
              approval: 6,
              eco: -9,
              party: 4,
              empathy: 7,
              integrity: 2,
              ideology: -2,
              courage: 3,
              energy: -8
            },
            {
              text: "Print Money \u2014 Just print more to cover the costs.",
              outcome: "Short term gain, but the Economy takes a massive hidden hit.",
              approval: 5,
              eco: -9,
              integrity: -7,
              empathy: 2,
              ideology: 5,
              courage: -6,
              energy: 3
            }
          ]
        },
        {
          title: "Tech Infrastructure",
          body: "Silicon Valley giants offer to build a nationwide 6G network for free in exchange for data rights.",
          choices: [
            {
              text: "Accept Deal \u2014 Modernize the nation for free.",
              outcome: "Economy surges with new tech, but privacy vanishes.",
              eco: 9,
              approval: 4,
              unrest: -6,
              empathy: -7,
              integrity: -7,
              ideology: -6,
              courage: 4,
              energy: 4
            },
            {
              text: "Public Build \u2014 Tax the rich to build a state-owned network.",
              outcome: "High integrity and jobs, but the Economy is staggering.",
              eco: -9,
              approval: 7,
              party: -7,
              empathy: 6,
              integrity: 7,
              ideology: 7,
              courage: 6,
              energy: -9
            },
            {
              text: "Hybrid Model \u2014 Private build with strict government oversight.",
              outcome: "Slower rollout, but maintains a balance of power.",
              eco: 7,
              unrest: 5,
              party: 3,
              empathy: 2,
              integrity: 4,
              ideology: 2,
              courage: 3,
              energy: -5
            },
            {
              text: "Reject \u2014 We don't need 6G yet.",
              outcome: "Saves money now, but the nation falls behind rivals.",
              eco: -7,
              tension: 7,
              integrity: 3,
              empathy: -2,
              ideology: -4,
              courage: -5,
              energy: 0
            }
          ]
        },
        {
          title: "Foreign Investment",
          body: "A rival nation wants to buy your largest domestic shipping port.",
          choices: [
            {
              text: "Sell Port \u2014 Use the cash to fund social programs.",
              outcome: "Huge economic boost and happy citizens, but Tension rises.",
              eco: 9,
              approval: 7,
              tension: 9,
              empathy: 5,
              integrity: -7,
              ideology: -7,
              courage: 3,
              energy: 5
            },
            {
              text: "Lease Only \u2014 99-year lease instead of a sale.",
              outcome: "Good revenue, but your Authority over the coast is weakened.",
              eco: 7,
              unrest: -7,
              tension: 6,
              empathy: 2,
              integrity: -3,
              ideology: -3,
              courage: 2,
              energy: 2
            },
            {
              text: "Block Sale \u2014 Keep the port in national hands.",
              outcome: "National security is safe, but the Economy misses out on billions.",
              eco: -8,
              tension: -7,
              unrest: 5,
              empathy: -2,
              integrity: 7,
              ideology: 6,
              courage: 5,
              energy: -2
            },
            {
              text: "Nationalize \u2014 Seize all private ports to ensure security.",
              outcome: "Total authority, but international investors flee in fear.",
              unrest: 9,
              eco: -9,
              tension: 8,
              empathy: -5,
              integrity: -6,
              ideology: 7,
              courage: 7,
              energy: -8
            }
          ]
        },
        {
          title: "Minimum Wage",
          body: "Labor unions are demanding a $25 minimum wage to combat the cost of living.",
          choices: [
            {
              text: "Full Increase \u2014 Give the workers exactly what they want.",
              outcome: "Record public approval, but small businesses begin to fail.",
              approval: 9,
              eco: -9,
              party: -7,
              empathy: 7,
              integrity: 7,
              ideology: -7,
              courage: 6,
              energy: -6
            },
            {
              text: "Tiered Raise \u2014 Increase it only for large corporations.",
              outcome: "Fair balance, but corporations threaten to leave.",
              approval: 7,
              eco: -5,
              party: -3,
              empathy: 5,
              integrity: 4,
              ideology: -3,
              courage: 4,
              energy: -3
            },
            {
              text: "Tax Credits \u2014 Keep wages low but give workers tax breaks.",
              outcome: "Businesses are happy, but the National Economy rises.",
              eco: -7,
              party: 7,
              approval: 4,
              empathy: 3,
              integrity: 2,
              ideology: 3,
              courage: -2,
              energy: -4
            },
            {
              text: "Reject \u2014 Inflation is too high to raise wages.",
              outcome: "Economy stays lean, but the public starts to riot.",
              eco: 6,
              approval: -9,
              unrest: 5,
              empathy: -7,
              integrity: 2,
              ideology: 6,
              courage: -4,
              energy: 2
            }
          ]
        },
        {
          title: "Luxury Tax",
          body: "Your advisors suggest a 50% tax on private jets and yachts to fix the budget.",
          choices: [
            {
              text: "Tax the Rich \u2014 Make the elite pay their share.",
              outcome: "Public approval rises, but your Party donors are furious.",
              approval: 8,
              party: -9,
              eco: 5,
              empathy: 6,
              integrity: 7,
              ideology: -5,
              courage: 5,
              energy: 3
            },
            {
              text: "Soft Tax \u2014 A 10% tax with many loopholes.",
              outcome: "Keeps the peace, but generates very little revenue.",
              party: 5,
              eco: 2,
              approval: -4,
              empathy: -2,
              integrity: -5,
              ideology: 2,
              courage: -3,
              energy: 1
            },
            {
              text: "Luxury Subsidy \u2014 Actually lower their taxes to \"encourage investment.\"",
              outcome: "Economy grows, but the public sees it as total corruption.",
              eco: 8,
              approval: -9,
              party: 7,
              empathy: -7,
              integrity: -8,
              ideology: 6,
              courage: 4,
              energy: -5
            },
            {
              text: "Nationalize Luxury \u2014 Seize private jets for government use.",
              outcome: "Massive authority boost, but the elite start a coup.",
              unrest: 9,
              party: -9,
              approval: -6,
              empathy: -4,
              integrity: -7,
              ideology: 7,
              courage: 7,
              energy: 5
            }
          ]
        },
        {
          title: "Automation Subsidy",
          body: "Companies want to replace 40% of their workforce with AI to double efficiency.",
          choices: [
            {
              text: "Support AI \u2014 Lead the world in the robotic revolution.",
              outcome: "Economy booms, but unemployment leads to massive unrest.",
              eco: 9,
              approval: -9,
              unrest: 6,
              empathy: -8,
              integrity: -6,
              ideology: 5,
              courage: 7,
              energy: -8
            },
            {
              text: "Human-First \u2014 Tax every robot that replaces a human.",
              outcome: "Saves jobs and approval, but the Economy slows down.",
              approval: 8,
              eco: -8,
              integrity: 7,
              empathy: 7,
              ideology: -4,
              courage: -3,
              energy: 2
            },
            {
              text: "Retraining Fund \u2014 Allow AI but spend billions to retrain workers.",
              outcome: "The most balanced path, but extremely expensive.",
              eco: -7,
              approval: 6,
              party: 4,
              empathy: 7,
              integrity: 6,
              ideology: -2,
              courage: 4,
              energy: -5
            },
            {
              text: "Ban AI \u2014 Keep technology out of the workplace.",
              outcome: "Stability returns, but rivals become much wealthier.",
              approval: 7,
              tension: 8,
              eco: -8,
              empathy: 4,
              integrity: 4,
              ideology: -7,
              courage: -6,
              energy: 4
            }
          ]
        },
        {
          title: "Welfare Expansion",
          body: "A new study shows 20% of children are hungry. A new food program is proposed.",
          choices: [
            {
              text: "Universal Food \u2014 Feed every child regardless of cost.",
              outcome: "Your empathy score hits 100, but the economy is strained.",
              approval: 9,
              eco: -9,
              party: -6,
              empathy: 9,
              integrity: 7,
              ideology: -6,
              courage: 4,
              energy: -9
            },
            {
              text: "Means-Tested \u2014 Only feed the poorest families.",
              outcome: "Saves money, but creates a massive bureaucracy.",
              approval: 7,
              eco: -6,
              party: 3,
              empathy: 6,
              integrity: 4,
              ideology: -2,
              courage: -2,
              energy: -4
            },
            {
              text: "Private Charity \u2014 Ask corporations to donate instead.",
              outcome: "Free for the state, but inconsistent and unreliable.",
              eco: 4,
              approval: -7,
              party: 5,
              empathy: -5,
              integrity: -4,
              ideology: 4,
              courage: -4,
              energy: 0
            },
            {
              text: "Work for Food \u2014 Parents must have a job to receive aid.",
              outcome: "Authority rises, but the public sees it as cruel.",
              unrest: 7,
              approval: -9,
              party: 6,
              empathy: -7,
              integrity: -3,
              ideology: 7,
              courage: 3,
              energy: 2
            }
          ]
        },
        {
          title: "Corporate Deregulation",
          body: "Big Oil says they can lower gas prices by 30% if you remove safety regulations.",
          choices: [
            {
              text: "Deregulate \u2014 Lower the prices at any cost.",
              outcome: "Approval and Economy rise, but a disaster is coming.",
              approval: 8,
              eco: 8,
              integrity: -8,
              empathy: -7,
              ideology: 6,
              courage: 5,
              energy: 5
            },
            {
              text: "Maintain Rules \u2014 Safety is more important than price.",
              outcome: "Integrity is high, but the public is angry about gas costs.",
              integrity: 7,
              approval: -8,
              eco: -4,
              empathy: 5,
              ideology: -4,
              courage: -4,
              energy: -3
            },
            {
              text: "Selective Cut \u2014 Remove only the \"minor\" rules.",
              outcome: "Small price drop, small safety risk.",
              approval: 4,
              eco: 5,
              integrity: -3,
              empathy: -2,
              ideology: 2,
              courage: 2,
              energy: 0
            },
            {
              text: "Nationalize Oil \u2014 Take over the industry and set the price yourself.",
              outcome: "Total control, but the global market crashes.",
              unrest: 9,
              eco: -9,
              tension: 9,
              empathy: -4,
              integrity: -6,
              ideology: 7,
              courage: 7,
              energy: -6
            }
          ]
        },
        {
          title: "Housing Crisis",
          body: "Rents have doubled in 2 years. People are living in cars in the capital.",
          choices: [
            {
              text: "Rent Caps \u2014 Make it illegal to raise rent.",
              outcome: "Tenants love you, but developers stop building.",
              approval: 9,
              eco: -8,
              party: -7,
              empathy: 7,
              integrity: 6,
              ideology: -7,
              courage: 5,
              energy: -2
            },
            {
              text: "Build Public \u2014 Use tax money to build state-owned apartments.",
              outcome: "Long term fix, but the Economy rises immediately.",
              eco: -9,
              approval: 7,
              integrity: 7,
              empathy: 7,
              ideology: -5,
              courage: 6,
              energy: -7
            },
            {
              text: "Deregulate Land \u2014 Allow building on parks and protected land.",
              outcome: "More houses, but the environment is destroyed.",
              eco: 7,
              approval: -7,
              integrity: -7,
              empathy: -5,
              ideology: 5,
              courage: 4,
              energy: 3
            },
            {
              text: "Ignore \u2014 The market will correct itself eventually.",
              outcome: "Saves money, but the streets are full of protesters.",
              eco: 4,
              approval: -9,
              unrest: -7,
              empathy: -8,
              integrity: -4,
              ideology: 4,
              courage: -7,
              energy: 0
            }
          ]
        },
        {
          title: "Tourism Campaign",
          body: "Your advisors want to spend $500M on a global ad campaign to bring in tourists.",
          choices: [
            {
              text: "Go Big \u2014 A massive, flashy Hollywood-style campaign.",
              outcome: "Economy and Approval rise as the world visits.",
              eco: 8,
              approval: 7,
              party: 4,
              empathy: 2,
              integrity: 2,
              ideology: -2,
              courage: 4,
              energy: -8
            },
            {
              text: "Eco-Tourism \u2014 Only promote your nation's \"unspoiled\" nature.",
              outcome: "High integrity, but lower revenue.",
              integrity: 6,
              eco: 5,
              approval: 4,
              empathy: 5,
              ideology: -4,
              courage: -2,
              energy: -2
            },
            {
              text: "Luxury Only \u2014 Only invite the ultra-rich to private resorts.",
              outcome: "High revenue, but the locals feel like servants.",
              eco: 9,
              approval: -7,
              party: 6,
              empathy: -7,
              integrity: -5,
              ideology: 6,
              courage: 3,
              energy: -5
            },
            {
              text: "Cancel \u2014 We shouldn't spend money on \"vacations.\"",
              outcome: "Saves money, but the hospitality industry fails.",
              eco: -7,
              approval: -4,
              integrity: 3,
              empathy: -2,
              ideology: 2,
              courage: -4,
              energy: 3
            }
          ]
        },
        {
          title: "Trade Deficit",
          body: "We are buying too much from our rivals and selling too little.",
          choices: [
            {
              text: "Heavy Tariffs \u2014 Tax all foreign imports by 40%.",
              outcome: "Local jobs return, but International Tension spikes.",
              tension: 9,
              eco: -7,
              party: 7,
              empathy: -4,
              integrity: 4,
              ideology: 7,
              courage: 7,
              energy: 2
            },
            {
              text: "Free Trade \u2014 Remove all barriers to trade.",
              outcome: "Tension drops, but local factories close down.",
              tension: -9,
              eco: 7,
              approval: -8,
              empathy: 5,
              integrity: -6,
              ideology: -7,
              courage: -5,
              energy: -4
            },
            {
              text: "Subsidize Local \u2014 Pay our own companies to keep prices low.",
              outcome: "Popular and safe, but the National Economy explodes.",
              eco: -9,
              approval: 7,
              party: 6,
              empathy: 4,
              integrity: 3,
              ideology: -2,
              courage: 2,
              energy: -7
            },
            {
              text: "Trade War \u2014 Ban all goods from our biggest rival.",
              outcome: "Total authority, but a global economic crash.",
              unrest: 9,
              tension: 9,
              eco: -9,
              empathy: -7,
              integrity: -5,
              ideology: 7,
              courage: 7,
              energy: +4
            }
          ]
        },
        {
          title: "Education Funding",
          body: "Teachers are on strike. They want a 30% raise and new schools.",
          choices: [
            {
              text: "Full Funding \u2014 Invest in the next generation.",
              outcome: "Long-term prosperity, but short-term Economy crisis.",
              approval: 9,
              eco: -9,
              integrity: 7,
              empathy: 8,
              ideology: -6,
              courage: 5,
              energy: -8
            },
            {
              text: "Performance Pay \u2014 Only give raises to the \"best\" teachers.",
              outcome: "Saves money, but the unions hate you.",
              eco: -5,
              party: -7,
              unrest: 6,
              empathy: -4,
              integrity: 2,
              ideology: 4,
              courage: 3,
              energy: -3
            },
            {
              text: "Private Schools \u2014 Give tax breaks for parents to use private education.",
              outcome: "High quality for some, but the poor are left behind.",
              eco: 6,
              approval: -9,
              party: 8,
              empathy: -7,
              integrity: -7,
              ideology: 6,
              courage: -2,
              energy: 0
            },
            {
              text: "Break Strike \u2014 Order teachers back to work by force.",
              outcome: "Authority rises, but the public is horrified.",
              unrest: 9,
              approval: -9,
              party: -7,
              empathy: -9,
              integrity: -8,
              ideology: 7,
              courage: 7,
              energy: 2
            }
          ]
        },
        {
          title: "Privatization",
          body: "The National Railway is losing money. A private firm wants to buy it.",
          choices: [
            {
              text: "Sell It \u2014 Stop the bleeding and get the cash.",
              outcome: "Economy falls, but ticket prices triple.",
              eco: 8,
              approval: -9,
              party: 5,
              empathy: -7,
              integrity: -7,
              ideology: -5,
              courage: 4,
              energy: 4
            },
            {
              text: "Modernize \u2014 Keep it public but spend billions on fast trains.",
              outcome: "Approval and Integrity rise, but Economy spikes.",
              approval: 8,
              eco: -9,
              integrity: 7,
              empathy: 6,
              ideology: 3,
              courage: 5,
              energy: -9
            },
            {
              text: "Partial Sale \u2014 Sell 49% but keep government control.",
              outcome: "Moderate revenue, moderate control.",
              eco: 6,
              unrest: 4,
              party: 3,
              empathy: 2,
              integrity: 2,
              ideology: -2,
              courage: 2,
              energy: 1
            },
            {
              text: "Shutdown \u2014 The trains are useless. Close the tracks.",
              outcome: "Huge savings, but the nation is disconnected.",
              eco: 9,
              approval: -9,
              unrest: -8,
              empathy: -7,
              integrity: -9,
              ideology: 5,
              courage: -6,
              energy: 5
            }
          ]
        },
        {
          title: "Universal Basic Income",
          body: "A radical plan suggests giving every citizen $1,000 a month.",
          choices: [
            {
              text: "National Rollout \u2014 End poverty in a single day.",
              outcome: "Historic approval, but the Economy might collapse.",
              approval: 9,
              eco: -8,
              party: -8,
              empathy: 9,
              integrity: 8,
              ideology: -7,
              courage: 7,
              energy: -10
            },
            {
              text: "City Pilot \u2014 Try it in one small city first.",
              outcome: "Interesting data, but other cities are jealous.",
              approval: 6,
              eco: -7,
              party: -3,
              empathy: 5,
              integrity: 5,
              ideology: -4,
              courage: 4,
              energy: -4
            },
            {
              text: "Negative Tax \u2014 Only give money to those who work.",
              outcome: "Encourages jobs, but leaves the disabled behind.",
              eco: -8,
              approval: 7,
              party: 5,
              empathy: -2,
              integrity: 3,
              ideology: 5,
              courage: 3,
              energy: -4
            },
            {
              text: "Reject \u2014 We are not a charity.",
              outcome: "Saves trillions, but the poor grow desperate.",
              eco: 7,
              approval: -9,
              integrity: -7,
              empathy: -9,
              ideology: 6,
              courage: -5,
              energy: 4
            }
          ]
        },
        {
          title: "Crypto Regulation",
          body: "A new digital currency is replacing the national dollar.",
          choices: [
            {
              text: "Ban It \u2014 Protect the national currency at all costs.",
              outcome: "Total authority, but young tech investors flee.",
              unrest: 9,
              approval: -8,
              eco: -7,
              empathy: -4,
              integrity: 4,
              ideology: 7,
              courage: 6,
              energy: 4
            },
            {
              text: "Adopt It \u2014 Make the crypto your official state currency.",
              outcome: "Tech boom, but International Tension rises.",
              eco: 9,
              tension: 9,
              unrest: -8,
              empathy: 2,
              integrity: -7,
              ideology: -7,
              courage: 7,
              energy: -10
            },
            {
              text: "Tax It \u2014 Allow it, but take a 30% cut of every trade.",
              outcome: "High revenue, but the market becomes slow.",
              eco: 8,
              unrest: 5,
              approval: -5,
              empathy: -2,
              integrity: 2,
              ideology: 3,
              courage: 2,
              energy: -5
            },
            {
              text: "Launch \"OvalCoin\" \u2014 Create your own government digital coin.",
              outcome: "High control and tech, but very expensive to build.",
              unrest: 8,
              eco: -9,
              party: 6,
              empathy: -3,
              integrity: 5,
              ideology: 7,
              courage: 5,
              energy: -8
            }
          ]
        },
        {
          title: "Agricultural Export",
          body: "There is a global food shortage. We could sell our wheat for 5x the price.",
          choices: [
            {
              text: "Export All \u2014 The treasury needs the gold.",
              outcome: "Massive profit, but local bread prices skyrocket.",
              eco: 9,
              approval: -9,
              party: 7,
              empathy: -9,
              integrity: -8,
              ideology: 4,
              courage: 6,
              energy: 5
            },
            {
              text: "Feed Home \u2014 Ban exports until every citizen is full.",
              outcome: "Record approval, but we miss a huge economic win.",
              approval: 9,
              eco: -9,
              tension: 7,
              empathy: 8,
              integrity: 7,
              ideology: -5,
              courage: -4,
              energy: -4
            },
            {
              text: "Surplus Only \u2014 Sell only what we don't eat.",
              outcome: "Moderate gain, moderate safety.",
              eco: 7,
              approval: 4,
              party: 2,
              empathy: 4,
              integrity: 5,
              ideology: -2,
              courage: 2,
              energy: 1
            },
            {
              text: "Buy Foreign \u2014 Sell our wheat and buy cheaper, lower quality food.",
              outcome: "Max profit, but the public gets sick.",
              eco: 9,
              approval: -9,
              integrity: -9,
              empathy: -9,
              ideology: 6,
              courage: 5,
              energy: 3
            }
          ]
        },
        {
          title: "Infrastructure Stimulus",
          body: "The bridges are falling apart. Engineers want a $50B \"New Deal.\"",
          choices: [
            {
              text: "Build Everything \u2014 Put everyone to work on the roads.",
              outcome: "Full employment and approval, but massive Economy.",
              approval: 9,
              eco: -9,
              party: 5,
              empathy: 7,
              integrity: 7,
              ideology: -4,
              courage: 7,
              energy: -10
            },
            {
              text: "Tolled Roads \u2014 Let private firms build and charge the public.",
              outcome: "Modern roads for free, but the public is angry.",
              eco: 7,
              approval: -9,
              party: 7,
              empathy: -6,
              integrity: -5,
              ideology: -6,
              courage: 3,
              energy: -2
            },
            {
              text: "Military Focus \u2014 Only fix roads used for tank transport.",
              outcome: "Authority rises, but civilians are ignored.",
              unrest: 9,
              approval: -8,
              tension: 7,
              empathy: -7,
              integrity: -4,
              ideology: 7,
              courage: 6,
              energy: -5
            },
            {
              text: "Patchwork \u2014 Only fix the bridges that have already collapsed.",
              outcome: "Saves money, but lives are at risk.",
              eco: 6,
              approval: -9,
              integrity: -8,
              empathy: -9,
              ideology: 2,
              courage: -5,
              energy: 2
            }
          ]
        },
        {
          title: "Wealth Cap",
          body: "A radical law suggests making it illegal to own more than $100 Million.",
          choices: [
            {
              text: "Pass Cap \u2014 Redistribute the wealth to the people.",
              outcome: "Historic equality, but the billionaires flee the nation.",
              approval: 9,
              eco: -8,
              party: -9,
              empathy: 9,
              integrity: 8,
              ideology: -8,
              courage: 7,
              energy: 3
            },
            {
              text: "Tax Over Cap \u2014 Take 90% of everything over the limit.",
              outcome: "High revenue, but industry slows down.",
              eco: -7,
              approval: 9,
              party: -7,
              empathy: 8,
              integrity: 7,
              ideology: -7,
              courage: 6,
              energy: 2
            },
            {
              text: "Encourage Giving \u2014 Give awards to billionaires who donate.",
              outcome: "Soft power, but no real change.",
              approval: 4,
              party: 5,
              eco: 2,
              empathy: 4,
              integrity: 3,
              ideology: 2,
              courage: -3,
              energy: 0
            },
            {
              text: "Protect Wealth \u2014 Defend the right to be rich.",
              outcome: "Investors love you, but the poor plan a riot.",
              eco: 8,
              approval: -9,
              party: 8,
              empathy: -9,
              integrity: -7,
              ideology: 7,
              courage: -6,
              energy: -2
            }
          ]
        },
        {
          title: "Stock Market Crash",
          body: "The market has dropped 15% in one day. Panic is spreading.",
          choices: [
            {
              text: "Bailout \u2014 Give billions to the banks to stop the slide.",
              outcome: "Economy is saved, but the public hates you.",
              eco: 9,
              approval: -9,
              party: 7,
              empathy: -9,
              integrity: -9,
              ideology: -6,
              courage: 7,
              energy: -8
            },
            {
              text: "Let it Fail \u2014 The banks made the mess; let them drown.",
              outcome: "Integrity is high, but the Economy enters a depression.",
              integrity: 9,
              eco: -9,
              approval: 7,
              empathy: 5,
              ideology: 6,
              courage: -4,
              energy: 5
            },
            {
              text: "Freeze Trading \u2014 Close the market for a week to calm everyone.",
              outcome: "Authority rises, but International Tension grows.",
              unrest: 9,
              tension: 8,
              eco: -8,
              empathy: -2,
              integrity: 4,
              ideology: 7,
              courage: 6,
              energy: -2
            },
            {
              text: "Buy the Dip \u2014 Use national funds to buy stocks and own the market.",
              outcome: "Total authority and wealth, but the public fears a takeover.",
              unrest: 9,
              eco: 9,
              approval: -9,
              empathy: -7,
              integrity: -8,
              ideology: 7,
              courage: 7,
              energy: -10
            }
          ]
        },
        {
          title: "National Airline",
          body: "The largest airline is bankrupt. Should the government take it over?",
          choices: [
            {
              text: "Create \"Oval Air\" \u2014 A state-owned airline for national pride.",
              outcome: "Authority and Approval rise, but it's a money pit.",
              unrest: 8,
              approval: 7,
              eco: -9,
              empathy: 3,
              integrity: 5,
              ideology: 6,
              courage: 5,
              energy: -9
            },
            {
              text: "Let it Die \u2014 If they can't fly, they shouldn't exist.",
              outcome: "Saves money, but thousands lose their jobs.",
              eco: 7,
              approval: -9,
              party: -7,
              empathy: -8,
              integrity: 4,
              ideology: -4,
              courage: -3,
              energy: 5
            },
            {
              text: "Foreign Buyout \u2014 Let a rival nation's airline buy it.",
              outcome: "Jobs are saved, but tension rises.",
              tension: 9,
              eco: 7,
              unrest: -7,
              empathy: 2,
              integrity: -6,
              ideology: -7,
              courage: -2,
              energy: 0
            },
            {
              text: "Subsidy Only \u2014 Give them a loan they never have to pay back.",
              outcome: "The party is happy (donors), but the public is angry.",
              party: 8,
              approval: -8,
              eco: -7,
              empathy: -4,
              integrity: -7,
              ideology: 4,
              courage: -4,
              energy: -4
            }
          ]
        }
      ],
      war: [
        {
          title: "The Border Skirmish",
          body: "A neighbor\u2019s drone was shot down in your airspace. They are demanding a formal apology and reparations.",
          choices: [
            {
              text: "Formal Apology \u2014 De-escalate the situation with a public apology and payment.",
              outcome: "The neighbor accepts the apology, but your base thinks you are weak.",
              tension: -6,
              approval: 3,
              party: -4,
              unrest: -2,
              eco: -2,
              empathy: 2,
              integrity: 3,
              ideology: -2,
              courage: -4,
              energy: -2
            },
            {
              text: "Mirror Strike \u2014 Send your own drone into their territory to show strength.",
              outcome: "Power is projected, but the border remains a powder keg.",
              tension: 7,
              unrest: 5,
              party: 3,
              approval: -6,
              eco: -3,
              empathy: -4,
              integrity: -5,
              ideology: 4,
              courage: 5,
              energy: -6
            },
            {
              text: "Deny Involvement \u2014 Claim it was a technical malfunction or a third party.",
              outcome: "Plausible deniability is maintained, though trust with allies is shaken.",
              tension: 2,
              unrest: -2,
              integrity: -7,
              approval: -2,
              eco: -1,
              empathy: -1,
              ideology: 1,
              courage: -4,
              energy: 0
            },
            {
              text: "International Arbitration \u2014 Take the case to the UN and let them decide.",
              outcome: "The world sees you as a diplomat, but the process takes years.",
              tension: -4,
              approval: 2,
              party: -6,
              unrest: -4,
              eco: -1,
              empathy: 3,
              integrity: 4,
              ideology: -3,
              courage: -3,
              energy: -1
            }
          ]
        },
        {
          title: "Refugee Crisis",
          body: "Thousands are fleeing a small conflict nearby and are at your gates.",
          choices: [
            {
              text: "Open Borders \u2014 Provide full asylum and path to work.",
              outcome: "You are a humanitarian hero, but the sudden scale strains the national budget.",
              approval: 7,
              eco: -6,
              tension: 7,
              party: -5,
              unrest: -3,
              empathy: 7,
              integrity: 5,
              ideology: -4,
              courage: 2,
              energy: -7
            },
            {
              text: "Tent Cities \u2014 Provide basic aid but keep them in restricted camps.",
              outcome: "Order is preserved, but human rights groups are increasingly critical.",
              approval: 2,
              eco: -4,
              unrest: 3,
              tension: 2,
              party: 1,
              empathy: 1,
              integrity: -2,
              ideology: 1,
              courage: -1,
              energy: -3
            },
            {
              text: "Push Back \u2014 Use the military to force them back across the border.",
              outcome: "The border is sealed, but international condemnation is swift.",
              unrest: 7,
              approval: -8,
              tension: 5,
              eco: 2,
              party: 4,
              empathy: -8,
              integrity: -7,
              ideology: 4,
              courage: 3,
              energy: -5
            },
            {
              text: "Air-Lift \u2014 Pay a third country to take them instead.",
              outcome: "The burden is shared, but the treasury is significantly drained.",
              eco: -7,
              tension: -3,
              approval: 1,
              party: 2,
              unrest: 1,
              empathy: -1,
              integrity: -2,
              ideology: -1,
              courage: -1,
              energy: -8
            }
          ]
        },
        {
          title: "The Arms Deal",
          body: "A friendly nation wants to buy your older fighter jets. Rivals are watching.",
          choices: [
            {
              text: "Finalize Sale \u2014 We need the revenue and the alliance.",
              outcome: "Money flows into the coffers, but regional rivals begin to mobilize.",
              eco: 7,
              party: 4,
              tension: 8,
              approval: -4,
              unrest: 2,
              empathy: -5,
              integrity: -6,
              ideology: 3,
              courage: 3,
              energy: 4
            },
            {
              text: "Veto Sale \u2014 Do not arm a nation currently in conflict.",
              outcome: "Your moral standing is secured, but the aerospace industry is furious.",
              integrity: 7,
              eco: -5,
              party: -7,
              tension: -6,
              approval: 3,
              empathy: 4,
              ideology: -3,
              courage: -2,
              energy: 0
            },
            {
              text: "Lease Only \u2014 Lease the jets but keep your own technicians on site.",
              outcome: "You keep a foothold in the region, but risk being dragged into their war.",
              unrest: 6,
              eco: -4,
              tension: 4,
              party: 2,
              approval: -1,
              empathy: -1,
              integrity: -2,
              ideology: 2,
              courage: 3,
              energy: -2
            },
            {
              text: "Defensive Only \u2014 Sell radar and shields only, no weapons.",
              outcome: "A safe middle ground that keeps the peace but brings in little revenue.",
              eco: 2,
              tension: 2,
              approval: -2,
              party: -3,
              unrest: -1,
              empathy: 1,
              integrity: 1,
              ideology: -1,
              courage: -3,
              energy: -3
            }
          ]
        },
        {
          title: "Intelligence Assets",
          body: "Your spies have found a \"backdoor\" into a rival nation\u2019s digital infrastructure.",
          choices: [
            {
              text: "Observe Only \u2014 Just watch and gather information.",
              outcome: "You gain a strategic advantage without the risk of immediate discovery.",
              unrest: 4,
              tension: 2,
              approval: 1,
              party: 2,
              empathy: -1,
              integrity: 3,
              ideology: 2,
              courage: -2,
              energy: -2
            },
            {
              text: "Extract Data \u2014 Steal their trade secrets to help our companies.",
              outcome: "Corporate profits rise, but the risk of a counter-hack is now extreme.",
              eco: 7,
              tension: 6,
              unrest: 2,
              party: 3,
              empathy: -2,
              integrity: -4,
              ideology: 2,
              courage: 3,
              energy: -5
            },
            {
              text: "Delete Access \u2014 This is too risky. Destroy the backdoor.",
              outcome: "The secret is safe, but your generals feel they've lost a vital weapon.",
              integrity: 7,
              party: -7,
              unrest: -6,
              tension: -7,
              approval: 4,
              empathy: 3,
              ideology: -4,
              courage: -5,
              energy: 2
            },
            {
              text: "Plant False Info \u2014 Feed them bad data to confuse their military.",
              outcome: "Their military plans are in chaos, though tension reaches a boiling point.",
              unrest: 6,
              tension: 7,
              party: 4,
              approval: -3,
              eco: -2,
              empathy: -3,
              integrity: -6,
              ideology: 3,
              courage: 5,
              energy: -4
            }
          ]
        },
        {
          title: "Peace Envoy",
          body: "Two small nations are in a trade war. They want you to mediate.",
          choices: [
            {
              text: "Host Summit \u2014 Bring them to the capital for a week of talks.",
              outcome: "You are seen as a global peacemaker, but the summit is a logistical nightmare.",
              tension: -7,
              eco: -2,
              approval: 3,
              party: -5,
              unrest: -4,
              empathy: 4,
              integrity: 6,
              ideology: -3,
              courage: -3,
              energy: -6
            },
            {
              text: "Support Stronger Side \u2014 Favor the nation that buys more of our goods.",
              outcome: "Economic ties are strengthened, but the smaller nation feels betrayed.",
              eco: 6,
              tension: 4,
              party: 3,
              approval: -3,
              unrest: 2,
              empathy: -4,
              integrity: -3,
              ideology: 2,
              courage: 2,
              energy: -2
            },
            {
              text: "Ignore Request \u2014 We have enough problems at home.",
              outcome: "You avoid the mess, but your international influence takes a noticeable dip.",
              eco: 2,
              tension: 4,
              unrest: -5,
              party: -4,
              approval: -2,
              empathy: -1,
              integrity: -1,
              ideology: -1,
              courage: -4,
              energy: 2
            },
            {
              text: "Sell to Both \u2014 Sell \"security consulting\" to both sides while they talk.",
              outcome: "The treasury grows, but the world sees you as a war-profiteer.",
              eco: 8,
              integrity: -9,
              tension: 5,
              approval: -7,
              party: 4,
              empathy: -7,
              ideology: 2,
              courage: 2,
              energy: 5
            }
          ]
        },
        {
          title: "Military Parade",
          body: "The Defense Department wants a holiday parade to showcase new hardware.",
          choices: [
            {
              text: "Full Display \u2014 Tanks and missiles in the city center.",
              outcome: "The public is awed by your strength, but allies see it as a threat.",
              unrest: 7,
              party: 6,
              tension: 7,
              approval: 3,
              eco: -4,
              empathy: -2,
              integrity: -3,
              ideology: 5,
              courage: 3,
              energy: -9
            },
            {
              text: "Focus on Service \u2014 A parade of soldiers and bands, no heavy weapons.",
              outcome: "A wholesome display that boosts morale without scaring the neighbors.",
              approval: 5,
              party: -3,
              eco: -2,
              tension: -2,
              unrest: -1,
              empathy: 4,
              integrity: 2,
              ideology: -2,
              courage: -1,
              energy: -3
            },
            {
              text: "Cancel Parade \u2014 Use the budget for a public park instead.",
              outcome: "Integrity rises as you choose peace over posturing, but the military is slighted.",
              approval: 7,
              eco: 3,
              party: -8,
              unrest: -7,
              tension: -4,
              empathy: 5,
              integrity: 6,
              ideology: -4,
              courage: -4,
              energy: 4
            },
            {
              text: "Joint Exercise \u2014 Cancel the parade and do a training drill instead.",
              outcome: "The troops are better prepared, but the region is on high alert.",
              unrest: 6,
              party: 5,
              tension: 4,
              approval: -2,
              eco: -3,
              empathy: -2,
              integrity: -1,
              ideology: 3,
              courage: 4,
              energy: -6
            }
          ]
        },
        {
          title: "The Defector",
          body: "A mid-level officer from a rival nation wants to switch sides.",
          choices: [
            {
              text: "Accept & Shelter \u2014 Take him in and provide a new life.",
              outcome: "You gain a new ally, but the rival nation declares it an act of aggression.",
              unrest: 5,
              tension: 7,
              party: 3,
              approval: 2,
              eco: -2,
              empathy: 3,
              integrity: 2,
              ideology: 2,
              courage: 4,
              energy: -4
            },
            {
              text: "Interrogate Heavily \u2014 Get the secrets first, then decide his fate.",
              outcome: "Valuable secrets are extracted, but the defector's life is ruined.",
              unrest: 7,
              tension: 7,
              integrity: -7,
              approval: -2,
              eco: -1,
              empathy: -4,
              ideology: 4,
              courage: 3,
              energy: -6
            },
            {
              text: "Reject Entry \u2014 We don't want the diplomatic headache.",
              outcome: "You avoid a diplomatic incident, but lose a potentially vital source.",
              tension: -6,
              unrest: -4,
              party: -5,
              approval: -3,
              eco: 1,
              empathy: -1,
              integrity: 2,
              ideology: -2,
              courage: -4,
              energy: 2
            },
            {
              text: "Trade Him \u2014 Give him back in exchange for a lower trade tariff.",
              outcome: "The economy benefits from the trade, but your integrity takes a hit.",
              eco: 5,
              tension: -6,
              party: -7,
              approval: -5,
              unrest: -4,
              empathy: -5,
              integrity: -7,
              ideology: -4,
              courage: -6,
              energy: 0
            }
          ]
        },
        {
          title: "Naval Patrols",
          body: "Your Navy wants to increase patrols in a disputed trade route.",
          choices: [
            {
              text: "Increase Presence \u2014 Send more ships to protect our merchants.",
              outcome: "Trade is secured, but the recurring fuel costs are immense.",
              unrest: 7,
              tension: 7,
              eco: -9,
              party: 4,
              approval: -2,
              empathy: -3,
              integrity: -4,
              ideology: 4,
              courage: 5,
              energy: -8
            },
            {
              text: "Maintain Current \u2014 No need to escalate right now.",
              outcome: "Stability is maintained for now, but the situation remains fragile.",
              eco: -1,
              tension: -1,
              approval: 1,
              party: 1,
              unrest: 1,
              empathy: 1,
              integrity: 1,
              ideology: 1,
              courage: 1,
              energy: -2
            },
            {
              text: "Reduce Patrols \u2014 Save fuel and lower tension with neighbors.",
              outcome: "The neighbors are pleased, but piracy begins to rise in the void.",
              eco: 8,
              unrest: -7,
              tension: -7,
              party: -7,
              approval: 3,
              empathy: 2,
              integrity: 5,
              ideology: -5,
              courage: -6,
              energy: 5
            },
            {
              text: "Drone Patrols \u2014 Use unmanned subs to watch the area.",
              outcome: "Constant surveillance provides safety without the high cost of sailors.",
              unrest: 6,
              eco: -7,
              tension: 4,
              party: 3,
              approval: -1,
              empathy: -2,
              integrity: -2,
              ideology: 3,
              courage: 4,
              energy: -5
            }
          ]
        },
        {
          title: "Cultural Exchange",
          body: "A rival nation wants to send their National Orchestra on a tour here.",
          choices: [
            {
              text: "Welcome Them \u2014 Art transcends politics.",
              outcome: "Borders feel softer for a moment, but your party suspects a trap.",
              tension: -7,
              approval: 5,
              party: -6,
              unrest: -3,
              eco: -2,
              empathy: 4,
              integrity: 5,
              ideology: -4,
              courage: -2,
              energy: -3
            },
            {
              text: "Demand Same \u2014 Only if our Rock Band can tour their capital.",
              outcome: "A fair deal that promotes mutual respect and cultural growth.",
              tension: -4,
              approval: 2,
              party: 2,
              unrest: 2,
              eco: -1,
              empathy: 1,
              integrity: 1,
              ideology: 1,
              courage: 2,
              energy: -2
            },
            {
              text: "Deny Visas \u2014 Their musicians might be spies.",
              outcome: "Safety is prioritized, but the world sees you as paranoid.",
              tension: 4,
              party: 5,
              approval: -4,
              unrest: 3,
              eco: 1,
              empathy: -2,
              integrity: -3,
              ideology: 3,
              courage: 2,
              energy: 0
            },
            {
              text: "Private Event \u2014 Let them play only for government officials.",
              outcome: "The elite are entertained, but the public feels excluded from the peace.",
              unrest: 5,
              party: 4,
              approval: -6,
              tension: 2,
              eco: -1,
              empathy: -3,
              integrity: -2,
              ideology: 4,
              courage: -1,
              energy: -1
            }
          ]
        },
        {
          title: "The Space Base",
          body: "Scientists want to build a shared research station with several allies.",
          choices: [
            {
              text: "Lead Project \u2014 We take the lead and pay the most.",
              outcome: "You lead the future of humanity, though it costs a king's ransom.",
              unrest: 6,
              tension: 4,
              eco: -8,
              party: 4,
              approval: 3,
              empathy: 2,
              integrity: 4,
              ideology: 3,
              courage: 5,
              energy: -10
            },
            {
              text: "Minority Partner \u2014 Join in but let someone else pay the bills.",
              outcome: "Progress is made at a fraction of the cost, but your influence is limited.",
              eco: -4,
              unrest: 2,
              party: 2,
              approval: 1,
              empathy: 1,
              integrity: 2,
              ideology: 1,
              courage: 1,
              energy: -4
            },
            {
              text: "Focus on Military \u2014 Build our own secret base instead.",
              outcome: "Military dominance in orbit is secured, but at the cost of total paranoia.",
              unrest: 7,
              tension: 7,
              eco: -9,
              party: 6,
              approval: -3,
              empathy: -4,
              integrity: -5,
              ideology: 7,
              courage: 7,
              energy: -8
            },
            {
              text: "Cancel Participation \u2014 Space is a waste of money.",
              outcome: "Money is saved, but you are left behind in the global technology race.",
              eco: 7,
              approval: -5,
              integrity: -3,
              empathy: -2,
              ideology: -2,
              courage: -4,
              energy: 5
            }
          ]
        },
        {
          title: "Foreign Aid",
          body: "A flood has hit a distant neutral country. They need help.",
          choices: [
            {
              text: "Significant Aid \u2014 Send food, ships, and doctors.",
              outcome: "You save thousands of lives and gain a lifelong friend in the region.",
              approval: 7,
              eco: -7,
              tension: -4,
              party: -5,
              unrest: -2,
              empathy: 7,
              integrity: 6,
              ideology: -4,
              courage: 2,
              energy: -9
            },
            {
              text: "Small Donation \u2014 Send a check and a message of support.",
              outcome: "A polite gesture that maintains ties without draining the treasury.",
              eco: -2,
              approval: 2,
              party: -1,
              tension: -1,
              empathy: 2,
              integrity: 1,
              ideology: -1,
              courage: -1,
              energy: -2
            },
            {
              text: "No Aid \u2014 Focus on our own infrastructure.",
              outcome: "The budget is balanced, but the world remembers your indifference.",
              eco: 4,
              approval: -6,
              party: 3,
              unrest: 2,
              tension: 2,
              empathy: -7,
              integrity: -4,
              ideology: 2,
              courage: -2,
              energy: 4
            },
            {
              text: "Loan Aid \u2014 Give them the money but they must pay it back with interest.",
              outcome: "You help a neighbor while ensuring the national Economy doesn't skyrocket.",
              eco: 6,
              approval: -4,
              party: 2,
              tension: -2,
              empathy: -3,
              integrity: -2,
              ideology: 2,
              courage: -1,
              energy: -3
            }
          ]
        },
        {
          title: "Embassy Security",
          body: "Protests are growing near your embassy in a rival city.",
          choices: [
            {
              text: "Add Guards \u2014 Send a team of Marines to protect the staff.",
              outcome: "The staff is safe, but the rival nation sees it as a military buildup.",
              unrest: 6,
              tension: 7,
              party: 4,
              approval: -2,
              eco: -3,
              empathy: -2,
              integrity: -1,
              ideology: 4,
              courage: 5,
              energy: -5
            },
            {
              text: "Evacuate Non-Essential \u2014 Get the families out now.",
              outcome: "Panic is avoided, but the staff feels abandoned by the capital.",
              tension: -4,
              approval: -3,
              eco: -5,
              party: -4,
              unrest: -2,
              empathy: 2,
              integrity: 3,
              ideology: -2,
              courage: -3,
              energy: -4
            },
            {
              text: "Close Embassy \u2014 Shut it down and leave the city.",
              outcome: "A total breakdown in diplomacy, though lives are arguably saved.",
              tension: -7,
              unrest: -7,
              party: -8,
              approval: -6,
              eco: -4,
              empathy: -4,
              integrity: -5,
              ideology: -5,
              courage: -7,
              energy: 3
            },
            {
              text: "Ignore \u2014 Trust the local police to handle it.",
              outcome: "The situation calms down, but your party thinks you were too risky.",
              tension: -2,
              unrest: -4,
              party: -6,
              approval: -2,
              eco: 1,
              empathy: -2,
              integrity: -3,
              ideology: -1,
              courage: -5,
              energy: 0
            }
          ]
        },
        {
          title: "The Fishing War",
          body: "Your fishermen are clashing with foreign boats in the open sea.",
          choices: [
            {
              text: "Escort Boats \u2014 Send Coast Guard to protect our fishermen.",
              outcome: "Your workers are safe, but a naval skirmish becomes much more likely.",
              unrest: 5,
              tension: 7,
              approval: 4,
              party: 3,
              eco: -4,
              empathy: -2,
              integrity: -2,
              ideology: 4,
              courage: 4,
              energy: -6
            },
            {
              text: "Negotiate Limits \u2014 Set a shared limit for both nations.",
              outcome: "A sustainable peace that protects the ocean and the peace.",
              tension: -6,
              approval: 2,
              party: -4,
              unrest: -3,
              eco: -2,
              empathy: 3,
              integrity: 4,
              ideology: -3,
              courage: -3,
              energy: -2
            },
            {
              text: "Ban Fishing \u2014 Close the area to everyone to avoid a fight.",
              outcome: "The water is quiet, but the fishing industry is effectively destroyed.",
              tension: -7,
              approval: -7,
              eco: -7,
              party: -6,
              unrest: -5,
              empathy: 4,
              integrity: 5,
              ideology: -5,
              courage: -4,
              energy: 3
            },
            {
              text: "Impound Foreign \u2014 Seize any foreign boat that enters.",
              outcome: "Authority is projected, but the local market suffers from the trade ban.",
              unrest: 7,
              tension: 8,
              approval: -4,
              party: 5,
              eco: 2,
              empathy: -5,
              integrity: -6,
              ideology: 6,
              courage: 6,
              energy: -5
            }
          ]
        },
        {
          title: "Satellite Launch",
          body: "Your military wants to launch a new \"Global Eye\" satellite.",
          choices: [
            {
              text: "Private Launch \u2014 Use a private company to keep it low-profile.",
              outcome: "The secret is safe, but the cost of the private contract is high.",
              eco: -6,
              unrest: 5,
              tension: 3,
              party: 3,
              approval: 1,
              empathy: -1,
              integrity: 2,
              ideology: 2,
              courage: 3,
              energy: -4
            },
            {
              text: "Military Launch \u2014 A proud, public display of rocket power.",
              outcome: "National pride soars, but the rival nation responds with their own launch.",
              unrest: 7,
              tension: 7,
              party: 5,
              approval: 3,
              eco: -7,
              empathy: -2,
              integrity: -3,
              ideology: 6,
              courage: 5,
              energy: -9
            },
            {
              text: "Delay Launch \u2014 Wait until diplomatic tensions cool down.",
              outcome: "Tensions cool, but the military is blind to current movements.",
              tension: -4,
              unrest: -4,
              approval: 2,
              eco: -1,
              party: -2,
              empathy: 2,
              integrity: 3,
              ideology: -2,
              courage: -4,
              energy: 2
            },
            {
              text: "Share Data \u2014 Launch it but let allies see the feed.",
              outcome: "Global trust is built, though you lose a core tactical advantage.",
              tension: -6,
              approval: 4,
              party: -5,
              unrest: -4,
              eco: -7,
              empathy: 4,
              integrity: 6,
              ideology: -3,
              courage: -2,
              energy: -3
            }
          ]
        },
        {
          title: "Cyber Security",
          body: "A major bank was hacked. The trail leads to a rival government.",
          choices: [
            {
              text: "Direct Sanctions \u2014 Freeze the assets of their top officials.",
              outcome: "The financial blow is returned, though a hot war is now on the horizon.",
              tension: 8,
              eco: -4,
              party: 5,
              approval: 2,
              unrest: 4,
              empathy: -2,
              integrity: 4,
              ideology: 4,
              courage: 6,
              energy: -2
            },
            {
              text: "Quiet Retaliation \u2014 Hack their Central Bank in return.",
              outcome: "A sophisticated response that satisfies the generals and the party.",
              unrest: 7,
              tension: 8,
              approval: -3,
              eco: 2,
              party: 4,
              empathy: -4,
              integrity: -6,
              ideology: 4,
              courage: 7,
              energy: -6
            },
            {
              text: "Public Complaint \u2014 Show the evidence to the world.",
              outcome: "The world is on your side, but the hackers are still at large.",
              tension: 5,
              approval: 4,
              party: -4,
              unrest: -2,
              eco: -1,
              empathy: 1,
              integrity: 4,
              ideology: 2,
              courage: -2,
              energy: -1
            },
            {
              text: "Increase Defense \u2014 Don't strike back; just make our walls higher.",
              outcome: "Peace is maintained, but citizens lose faith in digital banking.",
              eco: -7,
              approval: 2,
              party: 2,
              tension: -2,
              unrest: 3,
              empathy: 2,
              integrity: 5,
              ideology: 2,
              courage: -3,
              energy: -8
            }
          ]
        },
        {
          title: "Border Fence",
          body: "The Border Guard wants to build a new tech-enhanced fence.",
          choices: [
            {
              text: "Build High-Tech \u2014 Cameras, drones, and sensors everywhere.",
              outcome: "The border is air-tight, but the cost of maintenance is forever.",
              unrest: 7,
              eco: -8,
              approval: -4,
              party: 6,
              tension: 4,
              empathy: -6,
              integrity: -4,
              ideology: 6,
              courage: 4,
              energy: -10
            },
            {
              text: "Low-Tech Wall \u2014 A simple stone and wire barrier.",
              outcome: "A physical deterrent that is cheap but only moderately effective.",
              unrest: 5,
              eco: -6,
              approval: -2,
              party: 4,
              tension: 2,
              empathy: -4,
              integrity: -2,
              ideology: 4,
              courage: 2,
              energy: -3
            },
            {
              text: "Open Border \u2014 No fence; use the money for patrol cars.",
              outcome: "Mobility is high, though your party base feels the border is exposed.",
              approval: 6,
              eco: -3,
              party: -7,
              unrest: -6,
              tension: -5,
              empathy: 7,
              integrity: 4,
              ideology: -6,
              courage: -3,
              energy: 3
            },
            {
              text: "Joint Gate \u2014 Build a shared trade hub instead.",
              outcome: "Trade flourishes, though security experts warn of increased risks.",
              tension: -8,
              eco: 4,
              approval: 4,
              party: -6,
              unrest: -4,
              empathy: 5,
              integrity: 6,
              ideology: -5,
              courage: -2,
              energy: -2
            }
          ]
        },
        {
          title: "Rare Earth Trade",
          body: "A rival nation controls 90% of the minerals for your tank armor.",
          choices: [
            {
              text: "Stockpile \u2014 Buy as much as we can now before they ban it.",
              outcome: "Safety is bought at a high price, but the factories keep humming.",
              eco: -9,
              unrest: 6,
              tension: 4,
              party: 4,
              approval: -1,
              empathy: -2,
              integrity: 2,
              ideology: 3,
              courage: 2,
              energy: -7
            },
            {
              text: "Domestic Mining \u2014 Open new, expensive mines in our own mountains.",
              outcome: "Long-term security is established, but the environmental cost is high.",
              eco: -9,
              approval: -4,
              party: 6,
              unrest: 4,
              tension: -2,
              empathy: -3,
              integrity: 3,
              ideology: 3,
              courage: 5,
              energy: -9
            },
            {
              text: "Find Alternative \u2014 Spend billions on research for a new metal.",
              outcome: "Integrity is saved through science, but the project takes a decade.",
              eco: -9,
              approval: 3,
              integrity: 6,
              empathy: 4,
              ideology: -3,
              courage: 3,
              energy: -5
            },
            {
              text: "Sign Long-Term \u2014 Sign a 20-year trade deal with the rival.",
              outcome: "Economic stability is assured, though you are now tied to a rival.",
              tension: -9,
              eco: 6,
              unrest: -7,
              party: -8,
              approval: -4,
              empathy: 3,
              integrity: -5,
              ideology: -6,
              courage: -7,
              energy: -2
            }
          ]
        },
        {
          title: "The Secret Meeting",
          body: "A rival leader wants to meet you in secret on a private island.",
          choices: [
            {
              text: "Go Secretly \u2014 No cameras, no press, just talk.",
              outcome: "The talk is honest and deep, but the public feels kept in the dark.",
              tension: -7,
              approval: -4,
              party: -7,
              unrest: -2,
              eco: -1,
              empathy: 2,
              integrity: -6,
              ideology: -2,
              courage: 4,
              energy: -4
            },
            {
              text: "Make it Public \u2014 Insist on a formal, televised summit.",
              outcome: "The world watches a historic moment, though no real secrets are shared.",
              tension: 6,
              approval: 7,
              party: 5,
              unrest: 4,
              eco: -2,
              empathy: 2,
              integrity: 5,
              ideology: 4,
              courage: 3,
              energy: -5
            },
            {
              text: "Send Advisor \u2014 Don't go yourself; send your top diplomat.",
              outcome: "Risk is minimized, but the rival leader feels snubbed by your absence.",
              tension: -3,
              approval: 1,
              party: 2,
              unrest: -2,
              eco: -1,
              empathy: 1,
              integrity: 2,
              ideology: 1,
              courage: -2,
              energy: -2
            },
            {
              text: "Decline \u2014 We have nothing to say to them.",
              outcome: "Integrity is maintained, but a chance for peace is lost.",
              tension: 7,
              unrest: 4,
              party: 6,
              approval: -3,
              eco: -1,
              empathy: -4,
              integrity: -5,
              ideology: 4,
              courage: 2,
              energy: 1
            }
          ]
        },
        {
          title: "Olympic Hosting",
          body: "Both you and a rival nation want to host the next Games.",
          choices: [
            {
              text: "Bid Aggressively \u2014 Spend whatever it takes to win the bid.",
              outcome: "You win the world's stage, but the national Economy reaches a new peak.",
              eco: -9,
              approval: 7,
              party: 6,
              tension: 7,
              unrest: 4,
              empathy: 3,
              integrity: -4,
              ideology: 2,
              courage: 6,
              energy: -10
            },
            {
              text: "Shared Hosting \u2014 Suggest hosting the games together.",
              outcome: "A historic moment of cooperation that halves the cost for everyone.",
              tension: -9,
              eco: -7,
              approval: 6,
              party: -7,
              unrest: -6,
              empathy: 7,
              integrity: 7,
              ideology: -6,
              courage: -2,
              energy: -5
            },
            {
              text: "Withdraw \u2014 Let them have it; it's a money pit.",
              outcome: "The treasury is safe, but your national pride takes a public hit.",
              eco: 8,
              approval: -6,
              party: -7,
              tension: -6,
              unrest: -4,
              empathy: -2,
              integrity: 4,
              ideology: -2,
              courage: -5,
              energy: 4
            },
            {
              text: "Boycott \u2014 If they win, we aren't sending our athletes.",
              outcome: "A firm stance that pleases your party but isolates your athletes.",
              tension: 9,
              approval: -8,
              party: 7,
              unrest: 6,
              eco: -2,
              empathy: -7,
              integrity: -7,
              ideology: 6,
              courage: 5,
              energy: 0
            }
          ]
        },
        {
          title: "The Treaty Renewal",
          body: "A 50-year-old peace treaty is expiring.",
          choices: [
            {
              text: "Renew Exactly \u2014 Keep everything the same.",
              outcome: "Stability is preserved for another generation without controversy.",
              tension: -5,
              approval: 2,
              party: 2,
              unrest: 1,
              eco: 1,
              empathy: 2,
              integrity: 3,
              ideology: -1,
              courage: -2,
              energy: -1
            },
            {
              text: "Demand Changes \u2014 We want more trade access or we don't sign.",
              outcome: "A better deal for your traders, though the signing is tense.",
              eco: 7,
              tension: 8,
              party: 5,
              approval: -4,
              unrest: 4,
              empathy: -2,
              integrity: -3,
              ideology: 4,
              courage: 5,
              energy: -2
            },
            {
              text: "Let it Expire \u2014 The world has changed; we don't need this paper.",
              outcome: "Freedom is regained, but at the cost of total regional uncertainty.",
              unrest: 7,
              tension: 9,
              approval: -7,
              party: -8,
              eco: -4,
              empathy: -6,
              integrity: -7,
              ideology: 6,
              courage: 7,
              energy: 0
            },
            {
              text: "Expand Treaty \u2014 Invite three other nations to join the peace.",
              outcome: "A new era of peace is born, though your party fears a loss of sovereignty.",
              tension: -9,
              approval: 7,
              party: -7,
              unrest: -7,
              eco: -6,
              empathy: 7,
              integrity: 7,
              ideology: -7,
              courage: 3,
              energy: -4
            }
          ]
        }
      ],
      civilrights: [
        {
          title: "The Protest Wave",
          body: "Thousands are blocking the main highway demanding higher police accountability.",
          choices: [
            {
              text: "Meet Leaders \u2014 Invite the organizers to the Oval Office to hear their demands.",
              outcome: "Public approval rises, but your Party thinks you are being too soft.",
              approval: 6,
              party: -4,
              unrest: -3,
              empathy: 5,
              integrity: 3,
              ideology: -2,
              courage: 2,
              energy: -2
            },
            {
              text: "Clear Highway \u2014 Order the police to clear the road so traffic can resume.",
              outcome: "Authority is restored, but the public sees it as a lack of empathy.",
              unrest: 7,
              approval: -7,
              party: 4,
              empathy: -6,
              integrity: -4,
              ideology: 5,
              courage: 4,
              energy: -5
            },
            {
              text: "Ignore Them \u2014 Let the local Governor handle the situation.",
              outcome: "Saves your reputation, but the economy stalls from the blockage.",
              eco: -5,
              approval: -3,
              unrest: -2,
              empathy: -1,
              integrity: -2,
              ideology: 1,
              courage: -4,
              energy: 0
            },
            {
              text: "Partial Reform \u2014 Promise a committee study on the issue.",
              outcome: "A safe move that leaves everyone slightly frustrated.",
              approval: -2,
              party: -1,
              unrest: -1,
              eco: -1,
              empathy: 1,
              integrity: -2,
              ideology: -1,
              courage: -2,
              energy: -1
            }
          ]
        },
        {
          title: "Freedom of Press",
          body: "A major news outlet leaked a private memo about your cabinet's internal disagreements.",
          choices: [
            {
              text: "Ignore Leak \u2014 \"No comment.\" Let the story die on its own.",
              outcome: "Peaceful, but your Authority over the staff seems weak.",
              unrest: -4,
              approval: 2,
              tension: -2,
              empathy: 1,
              integrity: 2,
              ideology: -1,
              courage: -4,
              energy: 0
            },
            {
              text: "Defend Press \u2014 State that the media has a right to report what they find.",
              outcome: "High Integrity and Approval, but your Party feels vulnerable.",
              integrity: 7,
              approval: 5,
              party: -7,
              unrest: -5,
              empathy: 4,
              ideology: -4,
              courage: 3,
              energy: -2
            },
            {
              text: "Discredit Story \u2014 Call the report \"sensationalist\" and inaccurate.",
              outcome: "Your Party stays united, but your Integrity takes a hit.",
              party: 6,
              integrity: -7,
              approval: -3,
              unrest: 2,
              empathy: -2,
              ideology: 2,
              courage: 2,
              energy: -1
            },
            {
              text: "Find Leaker \u2014 Order an internal investigation to find who talked.",
              outcome: "Authority rises, but your staff becomes paranoid.",
              unrest: 7,
              party: -7,
              approval: -2,
              empathy: -3,
              integrity: -4,
              ideology: 3,
              courage: 5,
              energy: -4
            }
          ]
        },
        {
          title: "Immigration Visas",
          body: "The tech industry is begging for more H-1B visas for skilled engineers.",
          choices: [
            {
              text: "Approve Increase \u2014 Grant the request to help the economy.",
              outcome: "Economy surges, but your Party base fears for local jobs.",
              eco: 7,
              party: -7,
              approval: 3,
              empathy: 3,
              integrity: 2,
              ideology: -3,
              courage: 4,
              energy: -3
            },
            {
              text: "Limit Strictly \u2014 Only allow visas for the top 1% of applicants.",
              outcome: "Good for high-end industry, but looks elitist.",
              eco: 4,
              approval: -4,
              party: 2,
              empathy: -3,
              integrity: 1,
              ideology: 2,
              courage: 2,
              energy: -1
            },
            {
              text: "Domestic First \u2014 Freeze visas until more locals are trained.",
              outcome: "Authority and Party Loyalty rise; the economy slows.",
              unrest: 5,
              party: 7,
              eco: -6,
              approval: -7,
              empathy: -6,
              integrity: -4,
              ideology: 5,
              courage: 4,
              energy: 0
            },
            {
              text: "Rural Incentive \u2014 Grant visas only if they work in underdeveloped areas.",
              outcome: "Helps the poor regions, but companies find it difficult.",
              eco: 3,
              approval: 4,
              party: -3,
              empathy: 5,
              integrity: 3,
              ideology: -2,
              courage: 2,
              energy: -2
            }
          ]
        },
        {
          title: "Religious Landmark",
          body: "A community wants to build a center on a site significant to another group.",
          choices: [
            {
              text: "Protect Site \u2014 Declare the land a national monument to prevent construction.",
              outcome: "Approval and Party Loyalty rise, but Tension with the community grows.",
              approval: 7,
              party: 5,
              unrest: 3,
              empathy: -4,
              integrity: -5,
              ideology: 4,
              courage: -2,
              energy: -2
            },
            {
              text: "Allow Build \u2014 Defend the freedom to build on private property.",
              outcome: "High Integrity, but traditionalists are offended.",
              integrity: 6,
              approval: -7,
              party: -5,
              empathy: 3,
              ideology: -3,
              courage: 3,
              energy: -1
            },
            {
              text: "Relocate Offer \u2014 Offer a tax break to build on a nearby, neutral lot.",
              outcome: "A balanced compromise, but costs the Treasury.",
              eco: -5,
              approval: 2,
              party: 1,
              empathy: 2,
              integrity: 3,
              ideology: -1,
              courage: 1,
              energy: -4
            },
            {
              text: "Local Vote \u2014 Let the city residents decide via a ballot.",
              outcome: "Democracy wins, but you look like you're avoiding leadership.",
              unrest: -7,
              approval: -2,
              party: -3,
              empathy: -1,
              integrity: -3,
              ideology: -2,
              courage: -5,
              energy: -1
            }
          ]
        },
        {
          title: "Firearm Licensing",
          body: "A bill suggests mandatory 40-hour safety training for all new buyers.",
          choices: [
            {
              text: "Sign Bill \u2014 Support responsible ownership through education.",
              outcome: "Public approval rises, but your Party sees it as a burden.",
              approval: 7,
              party: -8,
              unrest: -6,
              eco: -2,
              empathy: 7,
              integrity: 5,
              ideology: -5,
              courage: 6,
              energy: -3
            },
            {
              text: "Mental Health Fund \u2014 Veto the bill but fund more counseling centers.",
              outcome: "High Empathy and Integrity, but the Economy rises.",
              eco: -7,
              approval: 5,
              integrity: 3,
              empathy: 7,
              ideology: -2,
              courage: 2,
              energy: -6
            },
            {
              text: "Veto Only \u2014 Reaffirm that current laws are sufficient.",
              outcome: "Party Loyalty and Authority rise; public feels less safe.",
              party: 7,
              unrest: 7,
              approval: -8,
              tension: 5,
              empathy: -7,
              integrity: 3,
              ideology: 5,
              courage: 4,
              energy: 0
            },
            {
              text: "Incentivize Safety \u2014 Give a tax credit to those who complete the training.",
              outcome: "Effective but adds to the national Economy.",
              eco: -7,
              approval: 4,
              party: -3,
              empathy: 2,
              integrity: 2,
              ideology: -1,
              courage: 1,
              energy: -4
            }
          ]
        },
        {
          title: "Pay Transparency",
          body: "Should companies be required to list salary ranges on job postings?",
          choices: [
            {
              text: "Mandate Listing \u2014 Transparency is key to a fair market.",
              outcome: "Approval and Empathy soar; businesses complain about \"red tape.\"",
              approval: 7,
              eco: -7,
              party: -7,
              empathy: 7,
              integrity: 5,
              ideology: -4,
              courage: 4,
              energy: -2
            },
            {
              text: "Voluntary Only \u2014 Encourage it but don't force companies.",
              outcome: "Safe and cheap, but the public sees no real change.",
              approval: -5,
              eco: 1,
              party: 2,
              empathy: -2,
              integrity: -3,
              ideology: 1,
              courage: -3,
              energy: 0
            },
            {
              text: "Business Credit \u2014 Give a small tax break to companies that comply.",
              outcome: "Moderate success, but the Treasury takes the hit.",
              eco: -7,
              approval: 4,
              party: 2,
              empathy: 3,
              integrity: 3,
              ideology: -1,
              courage: 2,
              energy: -4
            },
            {
              text: "Focus on Education \u2014 Fund programs that teach workers how to negotiate.",
              outcome: "Long-term gain, but provides no immediate relief.",
              eco: -5,
              approval: 2,
              integrity: 4,
              empathy: 4,
              ideology: -2,
              courage: 3,
              energy: -3
            }
          ]
        },
        {
          title: "Medical Funding",
          body: "A request for more federal funding for local community clinics has arrived.",
          choices: [
            {
              text: "Full Fund \u2014 Healthcare access should be a priority.",
              outcome: "High Approval and Empathy, but the Economy takes the hit.",
              approval: 8,
              eco: -9,
              party: -7,
              empathy: 8,
              integrity: 6,
              ideology: -5,
              courage: 6,
              energy: -9
            },
            {
              text: "Partial Fund \u2014 Fund only clinics in the most desperate areas.",
              outcome: "Pragmatic fix, but other regions feel left behind.",
              approval: 5,
              eco: -7,
              party: -3,
              empathy: 4,
              integrity: 3,
              ideology: -2,
              courage: 3,
              energy: -5
            },
            {
              text: "Veto \u2014 We cannot afford to increase spending right now.",
              outcome: "Economy stays stable, but Approval hits rock bottom.",
              eco: 6,
              approval: -9,
              party: 5,
              unrest: 2,
              empathy: -8,
              integrity: -6,
              ideology: 4,
              courage: 4,
              energy: 3
            },
            {
              text: "Private Partnership \u2014 Ask large hospitals to adopt the small clinics.",
              outcome: "Effective, but your Authority over the system decreases.",
              unrest: -5,
              approval: 3,
              eco: -2,
              party: 4,
              empathy: 2,
              integrity: -2,
              ideology: -3,
              courage: -2,
              energy: -1
            }
          ]
        },
        {
          title: "Digital Voting",
          body: "Advisors suggest allowing remote voting for military members stationed abroad.",
          choices: [
            {
              text: "National Rollout \u2014 Ensure every soldier has a voice.",
              outcome: "High approval from the military, but security experts are worried.",
              approval: 7,
              tension: 7,
              unrest: -4,
              eco: -3,
              empathy: 4,
              integrity: 2,
              ideology: -5,
              courage: 4,
              energy: -7
            },
            {
              text: "Paper Ballots \u2014 Stick to physical mail-in ballots for total security.",
              outcome: "High Authority and Security, but slows down the results.",
              unrest: 6,
              approval: -6,
              tension: -5,
              party: 2,
              empathy: -2,
              integrity: 5,
              ideology: 3,
              courage: -2,
              energy: -2
            },
            {
              text: "Limited Test \u2014 Try it for one small department first.",
              outcome: "Cautious; low impact on stats.",
              approval: 2,
              eco: -1,
              party: -1,
              empathy: 1,
              integrity: 1,
              ideology: -1,
              courage: -1,
              energy: -3
            },
            {
              text: "Mobile Units \u2014 Send more physical voting booths to overseas bases.",
              outcome: "Very expensive, but maintains high security.",
              eco: -7,
              approval: 6,
              party: 3,
              unrest: 4,
              empathy: 2,
              integrity: 3,
              ideology: 1,
              courage: 3,
              energy: -8
            }
          ]
        },
        {
          title: "Park Surveillance",
          body: "To stop vandalism, the park service wants to install cameras in national forests.",
          choices: [
            {
              text: "Deploy Now \u2014 Protect the beauty of the nation at all costs.",
              outcome: "Authority rises; the public feels slightly watched.",
              unrest: 7,
              approval: -7,
              tension: 5,
              party: 4,
              empathy: -6,
              integrity: -5,
              ideology: 4,
              courage: 3,
              energy: -8
            },
            {
              text: "Total Ban \u2014 Nature should be the one place free from technology.",
              outcome: "High Integrity and Approval, but vandalism increases.",
              approval: 6,
              unrest: -7,
              party: -4,
              eco: -2,
              empathy: 5,
              integrity: 7,
              ideology: -4,
              courage: -3,
              energy: 2
            },
            {
              text: "Limited View \u2014 Only place cameras at the main entrance and exits.",
              outcome: "A balanced approach with moderate stats.",
              unrest: 3,
              approval: -2,
              party: 1,
              empathy: -1,
              integrity: 2,
              ideology: 1,
              courage: 2,
              energy: -3
            },
            {
              text: "Private Security \u2014 Hire park rangers instead of using cameras.",
              outcome: "Creates jobs, but is much more expensive.",
              eco: -7,
              approval: 4,
              party: 2,
              empathy: 5,
              integrity: 3,
              ideology: -2,
              courage: 3,
              energy: -5
            }
          ]
        },
        {
          title: "Rural Healthcare",
          body: "Many small towns have lost their only doctor. Should we offer student loan forgiveness for those who move there?",
          choices: [
            {
              text: "Full Forgiveness \u2014 Incentivize medical care where it's needed most.",
              outcome: "High Approval and Empathy; very expensive.",
              approval: 8,
              eco: -9,
              party: -7,
              empathy: 7,
              integrity: 6,
              ideology: -5,
              courage: 5,
              energy: -7
            },
            {
              text: "Partial Subsidy \u2014 Only pay for the doctor's rent and equipment.",
              outcome: "A cheaper alternative with moderate results.",
              approval: 5,
              eco: -7,
              party: -3,
              empathy: 6,
              integrity: 4,
              ideology: -3,
              courage: 3,
              energy: -4
            },
            {
              text: "Virtual Care \u2014 Invest in high-speed internet and \"Tele-Health\" instead.",
              outcome: "Modern and efficient, but the elderly find it difficult.",
              eco: -7,
              approval: 3,
              unrest: 4,
              empathy: 2,
              integrity: 3,
              ideology: 2,
              courage: 3,
              energy: -6
            },
            {
              text: "Reject \u2014 We cannot pick winners and losers in the job market.",
              outcome: "Saves money, but rural approval vanishes.",
              eco: 6,
              approval: -8,
              party: -4,
              empathy: -8,
              integrity: -6,
              ideology: 4,
              courage: -4,
              energy: 3
            }
          ]
        },
        {
          title: "Workplace Fairness",
          body: "A law to ensure small businesses follow the same labor standards as big ones is up for debate.",
          choices: [
            {
              text: "Universal Standard \u2014 Every worker deserves the same protections.",
              outcome: "Approval and Empathy rise; small businesses struggle to pay.",
              approval: 7,
              eco: -7,
              party: -6,
              empathy: 7,
              integrity: 5,
              ideology: -4,
              courage: 4,
              energy: -4
            },
            {
              text: "Big Business Only \u2014 Don't burden the small family shops.",
              outcome: "Party Loyalty stays high, but workers feel unprotected.",
              party: 7,
              approval: -8,
              unrest: -4,
              empathy: -7,
              integrity: -6,
              ideology: 4,
              courage: 2,
              energy: -1
            },
            {
              text: "Tax Holiday \u2014 Pass the law but give small businesses a 2-year tax break.",
              outcome: "High Approval, but the Treasury is drained.",
              eco: -8,
              approval: 6,
              party: 3,
              empathy: 5,
              integrity: 4,
              ideology: -2,
              courage: 3,
              energy: -6
            },
            {
              text: "Study Group \u2014 Form a commission to see if the law is actually needed.",
              outcome: "Safely avoids a decision; nothing changes.",
              unrest: -5,
              approval: -2,
              party: -2,
              integrity: -3,
              ideology: -1,
              courage: -4,
              energy: -1
            }
          ]
        },
        {
          title: "Sentence Reform",
          body: "Should non-violent first-time offenders serve their time in community service rather than jail?",
          choices: [
            {
              text: "Reform Now \u2014 Free up the prisons and rehabilitate the people.",
              outcome: "High Empathy and Integrity; the Party thinks you're soft on crime.",
              empathy: 7,
              integrity: 7,
              approval: 4,
              eco: 5,
              party: -8,
              unrest: -7,
              ideology: -6,
              courage: 5,
              energy: 2
            },
            {
              text: "Partial Pilot \u2014 Try it for only one type of minor offense.",
              outcome: "A cautious move with low impact.",
              approval: 2,
              eco: 2,
              party: -3,
              unrest: -2,
              empathy: 3,
              integrity: 2,
              ideology: -2,
              courage: 2,
              energy: 1
            },
            {
              text: "Status Quo \u2014 A crime is a crime. Keep the current laws.",
              outcome: "Party Loyalty and Authority rise; prisons remain full.",
              party: 7,
              unrest: 6,
              eco: -7,
              approval: -8,
              empathy: -7,
              integrity: -5,
              ideology: 5,
              courage: 4,
              energy: -5
            },
            {
              text: "Work Release \u2014 Let them out only to do manual labor for the state.",
              outcome: "Authority rises; the public sees it as tough but fair.",
              unrest: 7,
              eco: 4,
              approval: -7,
              party: 3,
              empathy: -5,
              integrity: 2,
              ideology: 4,
              courage: 4,
              energy: 4
            }
          ]
        },
        {
          title: "Youth Employment",
          body: "Youth unemployment is rising. Advisors suggest a national internship program.",
          choices: [
            {
              text: "Full Program \u2014 Pay young people to work for the government.",
              outcome: "High Approval and Empathy; extremely expensive.",
              approval: 8,
              eco: -9,
              party: -7,
              empathy: 7,
              integrity: 6,
              ideology: -5,
              courage: 5,
              energy: -8
            },
            {
              text: "Private Credits \u2014 Give companies a tax break for hiring new graduates.",
              outcome: "Efficient, but the companies take the profit.",
              eco: -7,
              party: 6,
              approval: 4,
              empathy: 5,
              integrity: 3,
              ideology: 3,
              courage: 2,
              energy: -5
            },
            {
              text: "Skills Focus \u2014 Don't provide jobs; provide free vocational training.",
              outcome: "Long-term win; saves money today.",
              eco: -6,
              approval: 5,
              integrity: 5,
              empathy: 5,
              ideology: -2,
              courage: 3,
              energy: -4
            },
            {
              text: "Reject \u2014 The market will hire them if they have the skills.",
              outcome: "Saves billions, but Approval hits rock bottom.",
              eco: 6,
              approval: -8,
              integrity: -5,
              empathy: -7,
              ideology: 4,
              courage: -4,
              energy: 3
            }
          ]
        },
        {
          title: "Public Transit",
          body: "The national bus system is failing. Should we subsidize the fares?",
          choices: [
            {
              text: "Subsidize All \u2014 Keep the people moving for cheap.",
              outcome: "High Approval and Empathy; it's a \"money pit.\"",
              approval: 7,
              eco: -9,
              party: -7,
              empathy: 7,
              integrity: 5,
              ideology: -5,
              courage: 3,
              energy: -9
            },
            {
              text: "Upgrade Fleet \u2014 Don't lower fares; buy new, cleaner buses instead.",
              outcome: "Better for the environment; Approval is mid-range.",
              approval: 5,
              eco: -7,
              party: -4,
              empathy: 4,
              integrity: 4,
              ideology: -2,
              courage: 3,
              energy: -7
            },
            {
              text: "Privatize \u2014 Sell the buses to a private firm to save money.",
              outcome: "Economy falls, but fares will rise significantly.",
              eco: 8,
              approval: -9,
              party: 5,
              unrest: -6,
              empathy: -7,
              integrity: -7,
              ideology: -5,
              courage: 2,
              energy: 4
            },
            {
              text: "No Action \u2014 Let the locals handle their own transit.",
              outcome: "Saves money, but the poor lose their way to work.",
              eco: 4,
              approval: -8,
              party: -6,
              empathy: -7,
              integrity: -7,
              ideology: 2,
              courage: -5,
              energy: 0
            }
          ]
        },
        {
          title: "Heritage Protection",
          body: "A developer wants to build a shopping mall on a historical site.",
          choices: [
            {
              text: "Deny Permit \u2014 History is not for sale.",
              outcome: "High Integrity; the local economy misses out on jobs.",
              integrity: 8,
              approval: 6,
              party: -7,
              eco: -7,
              empathy: 4,
              ideology: -4,
              courage: 6,
              energy: -2
            },
            {
              text: "Allow Build \u2014 We need the jobs and the tax revenue.",
              outcome: "Economy rises; traditionalists are furious.",
              eco: 8,
              approval: -8,
              party: 7,
              empathy: -7,
              integrity: -7,
              ideology: 5,
              courage: 4,
              energy: -3
            },
            {
              text: "Move Site \u2014 Pay to move the historical building to a museum.",
              outcome: "Expensive but saves the history and the mall.",
              eco: -8,
              approval: 5,
              party: 3,
              empathy: 5,
              integrity: 4,
              ideology: -1,
              courage: 3,
              energy: -8
            },
            {
              text: "Partial Use \u2014 The mall must include a museum floor on the site.",
              outcome: "A messy compromise that satisfies no one.",
              eco: 4,
              approval: -4,
              party: -3,
              empathy: 2,
              integrity: -2,
              ideology: -1,
              courage: -3,
              energy: -4
            }
          ]
        },
        {
          title: "Online Privacy",
          body: "Should websites be required to get \"explicit consent\" for every piece of data they collect?",
          choices: [
            {
              text: "Pass Law \u2014 The citizen's data belongs to the citizen.",
              outcome: "Approval and Integrity soar; tech industry slows down.",
              approval: 7,
              eco: -8,
              party: -7,
              empathy: 7,
              integrity: 7,
              ideology: -6,
              courage: 4,
              energy: -3
            },
            {
              text: "Voluntary Shield \u2014 Create a \"State Privacy Seal\" for sites that opt-in.",
              outcome: "Good for branding, but ineffective.",
              approval: 3,
              eco: -2,
              party: 1,
              empathy: 2,
              integrity: 3,
              ideology: -1,
              courage: -2,
              energy: -1
            },
            {
              text: "Education Only \u2014 Teach citizens how to use privacy settings.",
              outcome: "Cheap and safe; does nothing to stop the companies.",
              eco: 2,
              approval: -5,
              integrity: -6,
              empathy: 2,
              ideology: 1,
              courage: -4,
              energy: -2
            },
            {
              text: "Reject \u2014 Data is the \"oil\" of the digital economy.",
              outcome: "Economy stays fast; Approval takes a hit.",
              eco: 7,
              approval: -7,
              party: 4,
              empathy: -6,
              integrity: -7,
              ideology: 5,
              courage: 3,
              energy: 0
            }
          ]
        },
        {
          title: "Teacher Salaries",
          body: "Teachers are asking for a cost-of-living adjustment.",
          choices: [
            {
              text: "Full Raise \u2014 Pay the people who build our future.",
              outcome: "High Approval and Empathy; extremely expensive.",
              approval: 8,
              eco: -7,
              party: -7,
              empathy: 8,
              integrity: 7,
              ideology: -6,
              courage: 5,
              energy: -8
            },
            {
              text: "Merit Pay \u2014 Only give raises to those whose students excel.",
              outcome: "Saves money; the unions are furious.",
              eco: -5,
              party: -7,
              unrest: 5,
              empathy: -4,
              integrity: 2,
              ideology: 4,
              courage: 4,
              energy: -4
            },
            {
              text: "Tax Breaks \u2014 Give teachers a $5,000 tax credit instead.",
              outcome: "Popular and easier on the budget than a salary.",
              eco: -7,
              approval: 6,
              party: 3,
              empathy: 4,
              integrity: 4,
              ideology: -2,
              courage: 3,
              energy: -5
            },
            {
              text: "Reject \u2014 We simply do not have the funds this year.",
              outcome: "Saves billions; a strike is likely.",
              eco: 7,
              approval: -9,
              party: 5,
              empathy: -7,
              integrity: -8,
              ideology: -4,
              courage: -6,
              energy: 3
            }
          ]
        },
        {
          title: "Urban Gardens",
          body: "Groups want to turn empty city lots into community vegetable gardens.",
          choices: [
            {
              text: "Fund All \u2014 Local food and local pride.",
              outcome: "High Approval and Empathy; moderate cost.",
              approval: 7,
              eco: -5,
              party: -3,
              empathy: 7,
              integrity: 5,
              ideology: -4,
              courage: 2,
              energy: -4
            },
            {
              text: "Sell to Devs \u2014 We need houses, not tomatoes. Sell the land.",
              outcome: "Economy rises; neighborhoods lose their charm.",
              eco: 7,
              approval: -7,
              party: 5,
              empathy: -6,
              integrity: -7,
              ideology: 4,
              courage: 4,
              energy: 2
            },
            {
              text: "Lease Only \u2014 Let them garden but reclaim the land if a buyer appears.",
              outcome: "Cautious; no one feels secure.",
              eco: 2,
              approval: -3,
              party: -2,
              empathy: 1,
              integrity: -2,
              ideology: 1,
              courage: -2,
              energy: -1
            },
            {
              text: "Tax Incentive \u2014 If you own a lot and make it a garden, pay no taxes.",
              outcome: "Effective for the public; Treasury loses out.",
              eco: -7,
              approval: 5,
              party: 3,
              empathy: 4,
              integrity: 4,
              ideology: -2,
              courage: 2,
              energy: -3
            }
          ]
        },
        {
          title: "Sports Funding",
          body: "The Olympic committee wants a billion-dollar training center for the nation's athletes.",
          choices: [
            {
              text: "Build It \u2014 National pride is worth every penny.",
              outcome: "High Approval and Authority; huge Economy.",
              approval: 7,
              unrest: 7,
              eco: -9,
              party: 5,
              empathy: 3,
              integrity: -4,
              ideology: 6,
              courage: 5,
              energy: -10
            },
            {
              text: "Corporate Sponsors \u2014 Let the athletes wear logos to pay for it.",
              outcome: "Free for the state; traditionalists hate the commercialism.",
              eco: 4,
              approval: -3,
              party: 4,
              integrity: -6,
              empathy: -2,
              ideology: -2,
              courage: -1,
              energy: -2
            },
            {
              text: "Community Focus \u2014 Spend the money on 100 small town gyms instead.",
              outcome: "High Empathy and Approval; athletes lose the elite center.",
              approval: 8,
              empathy: 7,
              eco: -9,
              party: -5,
              integrity: 5,
              ideology: -5,
              courage: 2,
              energy: -7
            },
            {
              text: "Reject \u2014 We have more important things to build.",
              outcome: "Saves a billion; you look \"un-patriotic.\"",
              eco: 7,
              approval: -7,
              party: -7,
              integrity: 4,
              empathy: -2,
              ideology: -2,
              courage: -5,
              energy: 4
            }
          ]
        },
        {
          title: "Holiday Mandate",
          body: "Should we create a new federal holiday to honor \"National Unity\"?",
          choices: [
            {
              text: "Create Holiday \u2014 Give everyone a day off to celebrate together.",
              outcome: "High Approval; the economy takes a 1-day hit.",
              approval: 8,
              eco: -7,
              party: 4,
              empathy: 6,
              integrity: 5,
              ideology: -1,
              courage: 2,
              energy: 5
            },
            {
              text: "Floating Holiday \u2014 Let citizens pick any day they want as their day off.",
              outcome: "High Integrity; hard for businesses to coordinate.",
              integrity: 7,
              approval: 6,
              eco: -7,
              party: -5,
              empathy: 4,
              ideology: -8,
              courage: -2,
              energy: -2
            },
            {
              text: "Remembrance Only \u2014 A day of speeches, but everyone still goes to work.",
              outcome: "Cheap and safe; the public feels cheated.",
              approval: -4,
              party: 2,
              eco: 1,
              empathy: 1,
              integrity: 2,
              ideology: 1,
              courage: -1,
              energy: -1
            },
            {
              text: "Reject \u2014 We already have too many holidays.",
              outcome: "Saves money; you look like a \"grinch.\"",
              eco: 4,
              approval: -7,
              party: -6,
              integrity: -4,
              empathy: -2,
              ideology: -4,
              courage: -3,
              energy: 0
            }
          ]
        }
      ],
      scandal: [
        {
          title: "The Donor\u2019s Kid",
          body: "A top donor\u2019s son was arrested for a DUI. They want you to make the charges \"disappear.\"",
          choices: [
            {
              text: "Refuse Help \u2014 Let the law take its course.",
              outcome: "You uphold the law, but the donor cuts off your campaign's primary funding source.",
              integrity: 6,
              approval: 4,
              party: -7,
              eco: -3,
              empathy: 2,
              ideology: -2,
              courage: 5,
              energy: -1
            },
            {
              text: "Suggest Lenience \u2014 Ask the DA to consider a plea deal instead of jail time.",
              outcome: "The donor stays happy, but rumors of \"two-tiered justice\" leak to the press.",
              party: 5,
              integrity: -5,
              approval: -3,
              unrest: -2,
              empathy: -2,
              ideology: 2,
              courage: -3,
              energy: -2
            },
            {
              text: "Full Pardon \u2014 Use your executive power to wipe the record clean.",
              outcome: "You prove your loyalty to your backers, but the public is outraged by the blatant cronyism.",
              party: 7,
              approval: -7,
              integrity: -7,
              unrest: 3,
              empathy: -4,
              ideology: 5,
              courage: -5,
              energy: -3
            },
            {
              text: "Public Condemnation \u2014 Use the event to give a speech about the dangers of drunk driving.",
              outcome: "You gain massive public approval, but you've made a permanent enemy of a powerful billionaire.",
              approval: 7,
              integrity: 5,
              party: -7,
              eco: -4,
              empathy: 6,
              ideology: -3,
              courage: 7,
              energy: 0
            }
          ]
        },
        {
          title: "The Tabloid Photo",
          body: "A photo surfaces of you at a wild party ten years ago holding something \"suspicious.\"",
          choices: [
            {
              text: "Admit Everything \u2014 \"I was young and made mistakes.\"",
              outcome: "Your honesty is refreshing to some, but conservative allies are deeply disappointed.",
              integrity: 7,
              approval: 4,
              party: -6,
              empathy: 5,
              ideology: -4,
              courage: 7,
              energy: 0
            },
            {
              text: "Claim it\u2019s Photshopped \u2014 Attack the tabloid for spreading fake imagery.",
              outcome: "Your base rallies behind you, but experts quickly prove the photo is authentic.",
              party: 6,
              approval: -5,
              integrity: -7,
              unrest: 3,
              empathy: -2,
              ideology: 4,
              courage: -4,
              energy: -2
            },
            {
              text: "Silence \u2014 Refuse to comment on \"tabloid trash.\"",
              outcome: "The story lingers for weeks, slowly draining your approval as the mystery grows.",
              approval: -6,
              party: -3,
              integrity: -3,
              unrest: 2,
              empathy: -1,
              ideology: 1,
              courage: -2,
              energy: 0
            },
            {
              text: "Dig Dirt Back \u2014 Leak a scandal about the editor of the tabloid.",
              outcome: "The story dies, but you've shown the world you play very dirty.",
              unrest: 6,
              approval: 2,
              integrity: -7,
              party: 3,
              empathy: -5,
              ideology: 3,
              courage: 4,
              energy: -4
            }
          ]
        },
        {
          title: "The Interior Remodel",
          body: "You used $500k of taxpayer money to \"secure\" your private vacation home with luxury upgrades.",
          choices: [
            {
              text: "Pay it Back \u2014 Use your personal savings to reimburse the state.",
              outcome: "You stop the scandal, but your personal finances are now in ruins.",
              integrity: 7,
              eco: -5,
              approval: 6,
              party: -3,
              empathy: 3,
              ideology: -3,
              courage: 6,
              energy: 0
            },
            {
              text: "Defend the Security \u2014 Argue that a President is never \"off duty\" and needs top-tier protection.",
              outcome: "Half the country accepts the logic; the other half sees it as a mansion renovation.",
              unrest: 5,
              approval: -6,
              integrity: -4,
              party: 4,
              empathy: -2,
              ideology: 2,
              courage: -2,
              energy: -3
            },
            {
              text: "Blame the Secret Service \u2014 Claim they made the decisions without your oversight.",
              outcome: "You shift the blame, but morale within your protection detail hits an all-time low.",
              party: 2,
              approval: 3,
              integrity: -7,
              empathy: -5,
              ideology: 1,
              courage: -5,
              energy: -1
            },
            {
              text: "Open for Public Tours \u2014 Turn the home into a \"National Heritage Site\" after your term.",
              outcome: "You spin the theft into a \"gift to the people,\" confusing the critics.",
              approval: 5,
              integrity: -4,
              eco: -2,
              party: 2,
              empathy: 4,
              ideology: -2,
              courage: 3,
              energy: -2
            }
          ]
        },
        {
          title: "The Shadow Lobbyist",
          body: "Your brother is taking \"consulting fees\" from a foreign tech company to get a meeting with you.",
          choices: [
            {
              text: "Ban Him \u2014 Bar your brother from the White House and all government buildings.",
              outcome: "You save your reputation, but your family is shattered and your brother goes to the press.",
              integrity: 7,
              approval: 6,
              party: -5,
              empathy: -6,
              ideology: -4,
              courage: 7,
              energy: 0
            },
            {
              text: "Take the Meeting \u2014 Listen to the company\u2019s pitch but promise nothing.",
              outcome: "The optics are terrible; everyone assumes the meeting was bought and paid for.",
              tension: -4,
              integrity: -7,
              approval: -5,
              party: 3,
              empathy: -2,
              ideology: 2,
              courage: -3,
              energy: -1
            },
            {
              text: "Direct the Fees \u2014 Tell him to donate the \"fees\" to a charity you support.",
              outcome: "It looks like a \"laundry\" scheme to critics, but the charity does good work.",
              approval: 4,
              integrity: -6,
              party: 2,
              empathy: 5,
              ideology: 1,
              courage: 2,
              energy: -2
            },
            {
              text: "Help the Company \u2014 Grant the foreign company a lucrative government contract.",
              outcome: "The economy gets a slight boost from the tech, but the bribery scandal is undeniable.",
              eco: 7,
              integrity: -7,
              approval: -7,
              party: 5,
              empathy: -7,
              ideology: 6,
              courage: 3,
              energy: -5
            }
          ]
        },
        {
          title: "The Old Tax Return",
          body: "An anonymous source leaks your taxes from 2015, showing you paid $0 through \"legal loopholes.\"",
          choices: [
            {
              text: "Reform the Code \u2014 Use the scandal to propose closing those specific loopholes.",
              outcome: "You look like a hypocrite turned hero, but wealthy donors are terrified.",
              approval: 7,
              eco: -6,
              party: -7,
              integrity: 5,
              empathy: 4,
              ideology: -5,
              courage: 7,
              energy: -3
            },
            {
              text: "\"That Makes Me Smart\" \u2014 Argue that you followed the law and any good businessman would do the same.",
              outcome: "Your business-minded base loves it; the working class feels insulted.",
              party: 6,
              approval: -7,
              integrity: -5,
              eco: 3,
              empathy: -6,
              ideology: 6,
              courage: 4,
              energy: 0
            },
            {
              text: "Investigate the Leak \u2014 Use the IRS to find out who leaked the private data.",
              outcome: "You look like you're using the government as a personal weapon of revenge.",
              unrest: 7,
              approval: -5,
              integrity: -7,
              party: 4,
              empathy: -4,
              ideology: 5,
              courage: 5,
              energy: -6
            },
            {
              text: "Ignore and Redirect \u2014 Start a war of words with a rival nation to change the subject.",
              outcome: "The tax story fades, but global tension rises as you play \"wag the dog.\"",
              tension: 7,
              approval: 2,
              integrity: -4,
              party: 3,
              empathy: -5,
              ideology: 2,
              courage: 4,
              energy: 2
            }
          ]
        },
        {
          title: "The Midnight Tryst",
          body: "An advisor is caught having an affair with a reporter in your briefing room.",
          choices: [
            {
              text: "Fire Immediately \u2014 Terminate the advisor for unprofessional conduct.",
              outcome: "You show high standards, but the advisor threatens to release sensitive info in revenge.",
              integrity: 6,
              approval: 4,
              party: -5,
              empathy: -2,
              ideology: -2,
              courage: 4,
              energy: 0
            },
            {
              text: "Cover it Up \u2014 Pay the reporter to kill the story.",
              outcome: "The secret stays safe for now, but you\u2019ve just given a journalist leverage over you.",
              eco: -4,
              integrity: -7,
              party: 3,
              approval: 2,
              empathy: -3,
              ideology: 2,
              courage: -5,
              energy: -3
            },
            {
              text: "Make it Legal \u2014 State that it was a private consensual matter on personal time.",
              outcome: "The media mocks you for being \"soft,\" but you keep your best advisor.",
              party: 4,
              approval: -5,
              integrity: -4,
              unrest: -2,
              empathy: 2,
              ideology: 1,
              courage: -2,
              energy: -1
            },
            {
              text: "Leak it First \u2014 Quietly leak the story yourself to a friendly outlet to control the narrative.",
              outcome: "You minimize the damage, but your staff learns that you can't be trusted.",
              unrest: 5,
              integrity: -3,
              approval: 2,
              party: -6,
              empathy: -4,
              ideology: 3,
              courage: 3,
              energy: -2
            }
          ]
        },
        {
          title: "The Stock Tip",
          body: "You receive a call from a CEO friend about a failing bank. You can sell your stocks before the news hits.",
          choices: [
            {
              text: "Don't Sell \u2014 Hold your shares and take the loss like everyone else.",
              outcome: "You lose money, but you avoid an insider trading charge that could end your career.",
              integrity: 7,
              eco: -6,
              approval: 5,
              party: -3,
              empathy: 3,
              ideology: -2,
              courage: 6,
              energy: 0
            },
            {
              text: "Sell & Donate \u2014 Sell the shares but give the proceeds to a public food bank.",
              outcome: "The \"profit\" is gone, but the act of selling still looks suspicious to investigators.",
              integrity: 4,
              approval: 7,
              eco: -2,
              empathy: 6,
              ideology: -2,
              courage: 3,
              energy: -2
            },
            {
              text: "Tip Your Party \u2014 Don't sell yourself, but tell party leaders to get their money out.",
              outcome: "Your party is eternally grateful for the save, but a whistleblower in the caucus is watching.",
              party: 7,
              integrity: -7,
              approval: -4,
              empathy: -5,
              ideology: 4,
              courage: 4,
              energy: -1
            },
            {
              text: "Sell Everything \u2014 Protect your personal wealth at all costs.",
              outcome: "You stay rich, but the ensuing SEC investigation creates a permanent dark cloud.",
              eco: 7,
              integrity: -7,
              approval: -7,
              party: 4,
              empathy: -7,
              ideology: 6,
              courage: 5,
              energy: -4
            }
          ]
        },
        {
          title: "The Hacked Tape",
          body: "A recording of you using a crude insult for a foreign leader is leaked online.",
          choices: [
            {
              text: "Apologize \u2014 Call the leader and issue a public statement of regret.",
              outcome: "You humble yourself to save the peace, but your base thinks you look weak.",
              tension: -5,
              integrity: 7,
              approval: -4,
              party: -6,
              empathy: 4,
              ideology: -4,
              courage: -3,
              energy: 0
            },
            {
              text: "Double Down \u2014 \"I said what I said, and they deserved it.\"",
              outcome: "Your popularity spikes with nationalists, but international relations freeze instantly.",
              tension: 7,
              approval: 7,
              party: 5,
              integrity: -7,
              empathy: -6,
              ideology: 6,
              courage: 6,
              energy: 0
            },
            {
              text: "Claim AI \u2014 State the tape is a \"Deepfake\" meant to destabilize the country.",
              outcome: "Many believe you, but tech experts begin a crusade to prove you are lying.",
              unrest: 6,
              approval: 3,
              integrity: -7,
              party: 4,
              empathy: -3,
              ideology: 4,
              courage: -2,
              energy: -4
            },
            {
              text: "Fire the Staffer \u2014 Blame the staffer who recorded it and fire them for \"misrepresenting\" you.",
              outcome: "You find a scapegoat, but the staffer releases more tapes in retaliation.",
              party: -7,
              approval: -2,
              integrity: -5,
              unrest: 3,
              empathy: -5,
              ideology: 2,
              courage: 2,
              energy: -1
            }
          ]
        },
        {
          title: "The Associate\u2019s Arrest",
          body: "Your long-time personal lawyer and fixer has been arrested for tax evasion. He knows all your secrets.",
          choices: [
            {
              text: "Distant Statement \u2014 Issue a cold press release stating you have \"no knowledge\" of his private business.",
              outcome: "The public is skeptical, and your party feels you are abandoning a loyal soldier.",
              integrity: 4,
              approval: -3,
              party: -6,
              empathy: -2,
              ideology: -2,
              courage: -4,
              energy: 0
            },
            {
              text: "Legal Defense Fund \u2014 Quietly funnel party donations to pay for his elite legal team.",
              outcome: "He stays quiet for now, but the drain on party funds causes grumbling among donors.",
              party: 5,
              eco: -3,
              integrity: -6,
              empathy: 2,
              ideology: 2,
              courage: 3,
              energy: -4
            },
            {
              text: "Visit in Secret \u2014 Meet him to ensure his loyalty, promising a future pardon.",
              outcome: "He remains loyal, but rumors of the meeting leak, damaging your moral standing.",
              party: 7,
              unrest: -2,
              integrity: -7,
              empathy: 2,
              ideology: 3,
              courage: 5,
              energy: -2
            },
            {
              text: "Throw to the Wolves \u2014 Publicly condemn his actions and call for the maximum sentence.",
              outcome: "The public loves the \"tough on crime\" stance, but your inner circle now fears you.",
              approval: 7,
              integrity: 6,
              party: -7,
              empathy: -6,
              ideology: -3,
              courage: 7,
              energy: 0
            }
          ]
        },
        {
          title: "The Campaign Promise",
          body: "You promised to lower taxes, but the economy needs a hike to survive.",
          choices: [
            {
              text: "Break Promise \u2014 Raise the taxes. The country comes first.",
              outcome: "The markets stabilize, but your base feels betrayed and the opposition pounces.",
              eco: 6,
              approval: -7,
              party: -6,
              integrity: 4,
              empathy: 2,
              ideology: 2,
              courage: 5,
              energy: -3
            },
            {
              text: "Keep Promise \u2014 Don't raise them. A promise is a promise.",
              outcome: "Your popularity holds, but the treasury continues to bleed value.",
              approval: 6,
              eco: -7,
              party: 4,
              integrity: 3,
              empathy: 2,
              ideology: -3,
              courage: -2,
              energy: -1
            },
            {
              text: "Tax The Other \u2014 Only raise taxes on foreign companies.",
              outcome: "A popular move at home that provides some cash, but it sparks a trade row.",
              eco: 3,
              tension: 6,
              approval: 3,
              party: 3,
              empathy: -2,
              integrity: -3,
              ideology: 2,
              courage: 3,
              energy: -2
            },
            {
              text: "Cut Services \u2014 Keep taxes low but shut down national libraries and parks.",
              outcome: "You save money without a tax hike, but the \"quality of life\" for citizens drops.",
              eco: 3,
              approval: -7,
              party: 2,
              empathy: -6,
              integrity: -3,
              ideology: -2,
              courage: 3,
              energy: 4
            }
          ]
        },
        {
          title: "The Private Server",
          body: "It\u2019s revealed you used a private email server for government business.",
          choices: [
            {
              text: "Hand Over All \u2014 Release every email to the public for transparency.",
              outcome: "Your integrity is praised, but the leaked internal drama hurts your party's image.",
              integrity: 7,
              approval: 5,
              party: -7,
              empathy: 3,
              ideology: -2,
              courage: 4,
              energy: -2
            },
            {
              text: "Delete Personal \u2014 Only release work emails; delete the private ones.",
              outcome: "You maintain some privacy, but the \"missing\" emails fuel conspiracy theories.",
              unrest: 3,
              integrity: -5,
              approval: -3,
              party: 3,
              empathy: -2,
              ideology: 2,
              courage: -2,
              energy: -1
            },
            {
              text: "Blame IT \u2014 Claim the IT department set it up without your knowledge.",
              outcome: "You dodge personal blame, but you look incompetent and lose staff loyalty.",
              party: -5,
              approval: 2,
              integrity: -6,
              empathy: -4,
              ideology: 1,
              courage: -3,
              energy: 0
            },
            {
              text: "Claim Privilege \u2014 State that executive privilege protects the server.",
              outcome: "You keep your data, but the public views it as a massive, authoritarian cover-up.",
              unrest: 6,
              approval: -7,
              integrity: -7,
              party: 4,
              empathy: -3,
              ideology: 5,
              courage: 2,
              energy: -3
            }
          ]
        },
        {
          title: "The Judicial Favor",
          body: "A judge you appointed is presiding over a case involving your biggest donor.",
          choices: [
            {
              text: "Recuse Judge \u2014 Demand the judge step down to avoid a conflict of interest.",
              outcome: "The legal system remains untainted, but your donors are furious at the lack of \"ROI.\"",
              integrity: 7,
              approval: 5,
              party: -7,
              empathy: 3,
              ideology: -3,
              courage: 5,
              energy: -1
            },
            {
              text: "Stay Neutral \u2014 Say the judiciary is independent and do nothing.",
              outcome: "You avoid a direct scandal, but critics call your silence a \"wink and a nod.\"",
              unrest: -3,
              approval: -2,
              integrity: -2,
              party: 2,
              empathy: 1,
              ideology: -1,
              courage: -3,
              energy: 0
            },
            {
              text: "Quiet Call \u2014 Suggest the judge \"look favorably\" on the donor.",
              outcome: "The donor wins, securing your funding, but your legal reputation is shattered.",
              party: 6,
              integrity: -7,
              approval: -7,
              empathy: -5,
              ideology: 4,
              courage: 3,
              energy: -2
            },
            {
              text: "Public Support \u2014 Defend the judge's character against media attacks.",
              outcome: "You rally your party against the \"fake news,\" but the cloud of bias remains.",
              party: 5,
              approval: -4,
              unrest: 3,
              integrity: -5,
              empathy: -2,
              ideology: 2,
              courage: 2,
              energy: -1
            }
          ]
        },
        {
          title: "The Leak Hunt",
          body: "A high-level meeting was leaked. Advisors want to use polygraphs on all staff.",
          choices: [
            {
              text: "Authorize Tests \u2014 Find the traitor at any cost.",
              outcome: "You find the mole, but the atmosphere in the West Wing becomes one of pure fear.",
              unrest: 7,
              party: -7,
              approval: -5,
              empathy: -6,
              integrity: -3,
              ideology: 5,
              courage: 4,
              energy: -5
            },
            {
              text: "Forgive & Forget \u2014 Address the leak with a speech on unity.",
              outcome: "Morale improves, but your enemies see it as a green light to leak more secrets.",
              empathy: 5,
              approval: 4,
              party: -4,
              unrest: -3,
              integrity: 3,
              ideology: -3,
              courage: -2,
              energy: 0
            },
            {
              text: "Fake Leak \u2014 Leak false info to see who repeats it.",
              outcome: "You catch the leaker through trickery, but your staff no longer knows what's real.",
              unrest: 5,
              integrity: -7,
              approval: -3,
              party: 2,
              empathy: -4,
              ideology: 3,
              courage: 3,
              energy: -3
            },
            {
              text: "Fire Inner Circle \u2014 Replace your top 3 advisors to be safe.",
              outcome: "You stop the leaks, but your administration loses months of progress in the chaos.",
              party: -7,
              unrest: 6,
              approval: -3,
              integrity: -6,
              empathy: -7,
              ideology: 3,
              courage: 6,
              energy: 0
            }
          ]
        },
        {
          title: "The Charity Foundation",
          body: "Your family charity received a massive donation from a country you just signed a trade deal with.",
          choices: [
            {
              text: "Return Money \u2014 Avoid even the appearance of a bribe.",
              outcome: "You are seen as incorruptible, but you offend a foreign partner and lose charity reach.",
              integrity: 7,
              eco: -4,
              approval: 5,
              party: -7,
              empathy: 3,
              ideology: -3,
              courage: 5,
              energy: -1
            },
            {
              text: "Freeze Funds \u2014 Lock the money away until your term ends.",
              outcome: "A safe middle ground that quietens the press but leaves the donors confused.",
              integrity: 4,
              approval: 2,
              party: -2,
              empathy: 2,
              ideology: -1,
              courage: 2,
              energy: 0
            },
            {
              text: "Use for Good \u2014 Use it for a high-profile public hospital.",
              outcome: "The tangible benefits for the poor drown out most of the corruption talk.",
              approval: 7,
              party: 3,
              integrity: -6,
              empathy: 7,
              ideology: 2,
              courage: 3,
              energy: -7
            },
            {
              text: "Defend Donation \u2014 Claim the charity's work is separate from politics.",
              outcome: "Your supporters believe you, but the international community smells a payoff.",
              party: 4,
              approval: -6,
              integrity: -7,
              empathy: -6,
              ideology: 3,
              courage: -2,
              energy: -2
            }
          ]
        },
        {
          title: "The Ghost Employees",
          body: "A journalist finds people on the government payroll who don't actually work.",
          choices: [
            {
              text: "Mass Fire \u2014 Terminate all ghost employees and sue for the money back.",
              outcome: "You save taxpayer money, but you've just fired several well-connected party hacks.",
              integrity: 7,
              eco: 5,
              approval: 7,
              party: -7,
              empathy: -3,
              ideology: 4,
              courage: 7,
              energy: 3
            },
            {
              text: "Blame System \u2014 Claim it's an old clerical error from the last president.",
              outcome: "You dodge the blame, but the public grows more cynical about \"government waste.\"",
              party: 3,
              approval: 2,
              integrity: -6,
              empathy: -2,
              ideology: 2,
              courage: -3,
              energy: 0
            },
            {
              text: "Quiet Remove \u2014 Let them resign one by one to avoid headlines.",
              outcome: "The problem goes away slowly, but a few disgruntled \"ghosts\" might talk later.",
              unrest: -3,
              approval: -2,
              integrity: -3,
              party: 2,
              empathy: -1,
              ideology: -2,
              courage: -3,
              energy: 1
            },
            {
              text: "Expand Program \u2014 Use the \"positions\" to hire your own supporters.",
              outcome: "Your party loyalty is absolute, but the corruption is now systematic and deep.",
              party: 7,
              integrity: -7,
              approval: -7,
              unrest: 5,
              empathy: -7,
              ideology: 6,
              courage: 3,
              energy: -6
            }
          ]
        },
        {
          title: "The Midnight Pardon",
          body: "Your party wants you to pardon a former official convicted of obstruction.",
          choices: [
            {
              text: "Pardon \u2014 He stayed loyal to the party; he deserves it.",
              outcome: "The party is relieved, but the justice system takes a massive hit in public eyes.",
              party: 7,
              unrest: -4,
              approval: -7,
              integrity: -7,
              empathy: -4,
              ideology: 5,
              courage: -2,
              energy: -1
            },
            {
              text: "Refuse \u2014 He broke the law; he serves the time.",
              outcome: "You stand for the law, but your party labels you a \"traitor\" to your own.",
              integrity: 7,
              party: -7,
              approval: 6,
              unrest: 4,
              empathy: 3,
              ideology: -6,
              courage: 7,
              energy: 0
            },
            {
              text: "Commute Only \u2014 Let him out of jail but keep the conviction on his record.",
              outcome: "A compromise that pleases no one fully but ends the immediate prison drama.",
              party: 5,
              approval: -4,
              integrity: -4,
              unrest: -2,
              empathy: 1,
              ideology: -2,
              courage: 2,
              energy: -1
            },
            {
              text: "Review Board \u2014 Hand it to an independent board and let them decide.",
              outcome: "You look weak but fair, allowing the \"system\" to take the heat for the choice.",
              integrity: 4,
              approval: 3,
              party: -7,
              unrest: -4,
              empathy: 3,
              ideology: -2,
              courage: -2,
              energy: -2
            }
          ]
        },
        {
          title: "The Real Estate Deal",
          body: "You sold your house for twice its value to a developer who wants government contracts.",
          choices: [
            {
              text: "Cancel Sale \u2014 Sell it to someone else for the market price.",
              outcome: "You lose out on millions, but your name remains clean in the eyes of the law.",
              integrity: 7,
              eco: -3,
              approval: 5,
              party: -5,
              empathy: 2,
              ideology: -2,
              courage: 5,
              energy: 0
            },
            {
              text: "Donate Profit \u2014 Keep the sale but give the extra money to charity.",
              outcome: "People are impressed by your generosity, though the developer still gets his \"in.\"",
              integrity: 5,
              approval: 6,
              eco: -3,
              empathy: 6,
              ideology: -2,
              courage: 3,
              energy: -2
            },
            {
              text: "Recuse Yourself \u2014 Continue the sale but don't vote on any of that developer's bids.",
              outcome: "You get the money, but your absence in meetings makes your authority look hollow.",
              integrity: 3,
              unrest: -3,
              party: 2,
              empathy: -1,
              ideology: -2,
              courage: -2,
              energy: 0
            },
            {
              text: "Full Speed \u2014 Take the money and help the developer.",
              outcome: "Your personal wealth grows, but the resulting \"sweetheart deals\" cause an uproar.",
              eco: 6,
              integrity: -7,
              approval: -7,
              party: 6,
              empathy: -7,
              ideology: 4,
              courage: 3,
              energy: -4
            }
          ]
        },
        {
          title: "The Medical Record",
          body: "A hacker has stolen your private medical records and threatens to reveal a minor health issue.",
          choices: [
            {
              text: "Release Yourself \u2014 Tell the public before the hacker can.",
              outcome: "Your bravery in being vulnerable earns you respect and kills the hacker's leverage.",
              integrity: 7,
              approval: 6,
              party: -4,
              empathy: 5,
              ideology: -2,
              courage: 7,
              energy: 0
            },
            {
              text: "Pay Ransom \u2014 Use party funds to keep the hacker quiet.",
              outcome: "The secret stays safe for now, but you are now being blackmailed by a criminal.",
              eco: -3,
              integrity: -7,
              party: 4,
              approval: 2,
              empathy: -3,
              ideology: 2,
              courage: -5,
              energy: -3
            },
            {
              text: "Send FBI \u2014 Hunt the hacker down and seize the data.",
              outcome: "You show strength, but civil libertarians worry about using the FBI for personal PR.",
              unrest: 7,
              tension: 4,
              party: 3,
              approval: -2,
              empathy: -4,
              integrity: -6,
              ideology: 4,
              courage: 7,
              energy: -7
            },
            {
              text: "Ignore \u2014 \"My health is private. Let them publish.\"",
              outcome: "You maintain your dignity, but the resulting rumors about your \"health\" create instability.",
              unrest: 5,
              approval: -7,
              party: -3,
              integrity: 2,
              empathy: -2,
              ideology: 1,
              courage: 4,
              energy: 0
            }
          ]
        },
        {
          title: "The Military Stock",
          body: "Your spouse bought $1 Million in defense stocks right before you signed a war bill.",
          choices: [
            {
              text: "Force Sale \u2014 Sell the stocks immediately and donate the profit.",
              outcome: "You look like a leader with high standards, though your spouse is understandably upset.",
              integrity: 7,
              approval: 6,
              party: -7,
              eco: -3,
              empathy: 4,
              ideology: -3,
              courage: 6,
              energy: -1
            },
            {
              text: "Blind Trust \u2014 Move all assets into a trust you cannot see.",
              outcome: "A technical fix that stops the headlines but doesn't fully erase the suspicion.",
              integrity: 5,
              approval: 3,
              party: -2,
              empathy: 2,
              ideology: -2,
              courage: 2,
              energy: -2
            },
            {
              text: "Defend Rights \u2014 Claim your spouse has the right to invest freely.",
              outcome: "You stand up for your family, but the \"war profiteer\" label sticks to your name.",
              party: 6,
              approval: -7,
              integrity: -7,
              eco: 2,
              empathy: -6,
              ideology: 4,
              courage: 3,
              energy: 0
            },
            {
              text: "Secret Transfer \u2014 Move the stocks to a shell company in your cousin's name.",
              outcome: "You keep the money hidden, but you've just committed a felony that could end you.",
              eco: 5,
              integrity: -7,
              approval: -7,
              party: 5,
              empathy: -7,
              ideology: 5,
              courage: -4,
              energy: -3
            }
          ]
        },
        {
          title: "The Final Choice",
          body: "A foreign leader offers you a guaranteed $100M \"Global Advisor\" job if you sign a specific treaty today.",
          choices: [
            {
              text: "Refuse & Expose \u2014 Tell the world about the bribe and end the treaty.",
              outcome: "You leave office a hero of global integrity, though you make a lifelong enemy abroad.",
              integrity: 7,
              tension: 7,
              approval: 7,
              party: -7,
              unrest: -3,
              empathy: 7,
              ideology: -6,
              courage: 7,
              energy: 0
            },
            {
              text: "Sign & Take Job \u2014 You've served your country; now serve yourself.",
              outcome: "You secure your future wealth, but your legacy is forever tarnished as a \"sell-out.\"",
              eco: 7,
              integrity: -7,
              approval: -7,
              party: 7,
              unrest: -5,
              empathy: -7,
              ideology: 7,
              courage: -7,
              energy: -5
            },
            {
              text: "Sign but Refuse Job \u2014 Sign because the treaty is good, but don't take the money.",
              outcome: "You do the right thing for the wrong reasons, but the world is objectively safer.",
              tension: -7,
              integrity: 7,
              approval: 6,
              party: 4,
              unrest: 2,
              empathy: 5,
              ideology: -4,
              courage: 6,
              energy: -2
            },
            {
              text: "Counter-Bribe \u2014 Demand $200M.",
              outcome: "You are now fully part of a global criminal elite. You are rich, but you are a puppet.",
              eco: 7,
              integrity: -7,
              approval: -7,
              party: 7,
              unrest: -4,
              empathy: -7,
              ideology: 7,
              courage: -7,
              energy: -8
            }
          ]
        }
      ]
    };


    const ARCS = [
      {
        id: 'convergence_route', name: 'Convergence Route', trigger: () => gs.highTensionTurns >= 3 || gs.bars.internationalTension >= 100, acts: [
          {
            tag: 'ACT I', title: 'The Ultimatum',
            body: 'A coalition of world powers has issued an ultimatum: Disarm your borders and allow foreign inspectors into your nuclear sites, or face a coordinated "intervention."',
            choices: [
              { text: "Reject Defiantly", outcome: "You send the inspectors home. The world prepares for war. The 'coalition' of rivals is now an active invasion force.", tension: 18, approval: 15, unrest: 12, courage: 20, nextAct: 1 },
              { text: "Strategic Delay", outcome: "You buy time with vague promises, but the cost to your international reputation is severe. The coalition is suspicious, but their engines are cooling—for now.", tension: -10, integrity: -12, unrest: -10, courage: -15, nextAct: 2 },
              { text: "Partial Disarmament", outcome: "You dismantle your borders to save your cities. The coalition is pleased, but your own military feels betrayed and your people feel vulnerable.", tension: -20, approval: -18, party: -15, unrest: -20, nextAct: 3 },
              { text: "Pre-emptive Strike", outcome: "The fire of your first strike lights up the horizon. You have taken the initiative, but you have also guaranteed a total, global response.", tension: 25, approval: 10, eco: -20, empathy: -25, nextAct: 4 }
            ]
          },
          {
            tag: 'ACT II.1', title: 'The Fortress Path',
            body: 'You stood your ground, and now a total naval blockade has cut off your trade. Your merchant ships are being seized and your ports are silent.',
            choices: [
              { text: "Break the blockade by force", outcome: "The naval battle is fierce. You break the line, but at the cost of your strongest cruisers and a massive spike in global hostility.", tension: 22, eco: -20, courage: 18, nextAct: 5 },
              { text: "Implement national rationing", outcome: "The nation survives on meager portions. The economy is a memory, but the collective struggle binds the people to your leadership.", eco: 18, approval: -22, empathy: 20, nextAct: 6 },
              { text: "Request a neutral mediator", outcome: "A third party steps in. The blockade is eased, but you have had to reveal classified defense secrets to earn their trust.", integrity: 20, tension: -18, unrest: -15, nextAct: 7 },
              { text: "Accuse the world of piracy", outcome: "The UN debates while your ports remain silent. You have the moral high ground, but the shelves in your grocery stores are empty.", approval: 18, integrity: -22, tension: 18, nextAct: 8 }
            ]
          },
          {
            tag: 'ACT II.2', title: 'The Summit Path',
            body: 'The world is meeting at your border. They demand you step down to ensure peace, claiming your leadership is the only obstacle to a ceasefire.',
            choices: [
              { text: "Walk out of the summit", outcome: "The doors slam behind you. Any hope for a diplomatic exit is gone. The coalition sees your exit as a declaration of total defiance.", tension: 20, approval: 15, courage: 18, nextAct: 9 },
              { text: "Agree to a Transition Government", outcome: "You sign the papers. You are no longer the master of your fate, but at least the bombs have stopped falling on your civilians.", unrest: -25, integrity: 20, party: -20, nextAct: 10 },
              { text: "Propose a joint security pact", outcome: "A desperate proposal. The coalition is divided on the offer, buying you critical weeks of relative peace.", integrity: 18, tension: -20, unrest: -18, nextAct: 11 },
              { text: "Bribe a coalition member", outcome: "Gold buys silence. One member of the coalition stalls the invasion vote, but the cost has nearly drained the national treasury.", eco: -20, integrity: -25, tension: -15, nextAct: 12 }
            ]
          },
          {
            tag: 'ACT II.3', title: 'The Pacifist Path',
            body: 'Despite disarming, a "Peacekeeping Force" has crossed your border to "secure" your cities. They are setting up checkpoints in your capital.',
            choices: [
              { text: "Order the military to resist", outcome: "The 'peacekeepers' are now combatants. The blood in the streets is a sign of a nation that refuses to die quietly.", tension: 22, approval: 18, courage: 18, nextAct: 13 },
              { text: "Welcome them as 'guests'", outcome: "The occupation is total. You are a guest in your own palace, while foreign soldiers dictate the law of the land.", approval: -25, unrest: -25, tension: -20, nextAct: 14 },
              { text: "Appeal to the UN for help", outcome: "The UN issued a resolution, but the coalition's tanks are already in the city center. Paper is no shield against iron.", integrity: 20, tension: -15, unrest: -18, nextAct: 15 },
              { text: "Sabotage your own oil fields", outcome: "The black smoke is your final protest. The world's energy supply is hit, but your own environment is a toxic wasteland.", eco: -30, tension: 18, courage: 20, nextAct: 16 }
            ]
          },
          {
            tag: 'ACT II.4', title: 'The Warmonger Path',
            body: 'Your strike hit home, but now the sky is full of enemy bombers heading for your capital. The air raid sirens are screaming across the country.',
            choices: [
              { text: "Scramble all air defenses", outcome: "The sky is a mesh of fire. You saved the capital, but your air fleet is decimated and the people are living in the ruins of the metro system.", tension: 20, approval: -18, unrest: 15, nextAct: 17 },
              { text: "Call for a global ceasefire", outcome: "You call for peace after the first blood is drawn. The coalition is hesitant, seeing your strike as a desperate cry for negotiation.", tension: -18, integrity: 18, courage: -15, nextAct: 18 },
              { text: "Relocate to the mountain bunker", outcome: "The mountain is safe, but the capital is an open target. The public's trust in your protection is buried under the rubble.", unrest: -18, approval: -25, courage: -20, nextAct: 19 },
              { text: "Mobilize the civilian guard", outcome: "Every window is a sniper nest. The occupation will be slow and bloody, turning your country into a global nightmare.", unrest: 22, approval: 18, empathy: -25, nextAct: 20 }
            ]
          },
          {
            tag: 'ACT III.1', title: 'The Sea Battle',
            body: 'Your navy is engaged in a massive surface battle to break the blockade. The outcome will decide if your people starve or trade.',
            choices: [
              { text: "Commit the air force to assist", outcome: "Your jets are in the air. The 'intervention' has become a full-scale battle for the capital.", eco: 15, tension: 15, unrest: -10, nextAct: 21 },
              { text: "Pull back and defend the coast", outcome: "You surrender the airfields. The coalition moves in, and for the first time in a century, foreign boots are in the Presidential Palace.", unrest: -15, approval: -15, eco: -20, nextAct: 21 },
              { text: "Deploy underwater mines", outcome: "The world's energy supply is hit, but your own reputation as a guardian of the future is gone.", integrity: -25, courage: 18, tension: 10, nextAct: 21 },
              { text: "Order a fighting retreat", outcome: "You remain in the bunker, but the nation is already under new management.", tension: -15, unrest: -20, approval: -10, nextAct: 21 }
            ]
          },
          {
            tag: 'ACT III.2', title: 'The Breadline',
            body: 'Famine is setting in. The people are beginning to riot at government food distribution centers.',
            choices: [
              { text: "Open the strategic reserves", outcome: "The stores are open, but once the grain is gone, the hunger will return with a vengeance.", approval: 20, eco: -18, unrest: -10, nextAct: 21 },
              { text: "Blame foreign sabotage", outcome: "The people find a target for their anger, but you have fueled a fire that could burn the whole city down.", approval: 10, tension: 15, integrity: -15, nextAct: 21 },
              { text: "Impose food labor quotas", outcome: "The factories are humming, but the workers' eyes are filled with a cold, quiet fury.", unrest: 18, empathy: -20, eco: 10, nextAct: 21 },
              { text: "Appeal for a Red Cross corridor", outcome: "The red cross arrives, but the coalition uses the pause in fighting to reposition their heavy artillery.", integrity: 15, unrest: -15, approval: 8, nextAct: 21 }
            ]
          },
          {
            tag: 'ACT III.3', title: 'The Mediator',
            body: 'A neutral nation offers to host a secret meeting, but the coalition is monitoring all your communications.',
            choices: [
              { text: "Travel in secret", outcome: "You slip past the checkpoints. The world's eyes are elsewhere while you slip into the shadows of history.", integrity: 18, courage: 15, unrest: -12, nextAct: 22 },
              { text: "Refuse the meeting location", outcome: "The summit is a failure. Any hope for a diplomatic exit is gone, and the coalition prepares for a final assault.", tension: 15, unrest: 10, integrity: -20, nextAct: 22 },
              { text: "Send your VP instead", outcome: "The VP handles the compromise, while you remain the face of defiance. A dangerous split in the administration is born.", unrest: -12, integrity: -12, tension: 10, nextAct: 22 },
              { text: "Broadcast a peace proposal", outcome: "Your words reach the hearts of the global public. The coalition is shamed into a temporary, but fragile, ceasefire.", approval: 15, integrity: 12, party: -15, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.4', title: 'The Propaganda',
            body: 'Your narrative is winning hearts abroad, but the physical war remains one-sided against your forces.',
            choices: [
              { text: "Encourage global walkouts", outcome: "The global economy shudders under the weight of your call. The coalition is feeling the pressure from their own citizens.", tension: 18, integrity: 15, eco: -10, nextAct: 22 },
              { text: "Buy airtime on global networks", outcome: "Your narrative fills the airwaves. The world watches as you present your case directly to the people.", eco: -15, approval: 12, integrity: 10, nextAct: 22 },
              { text: "Censor all foreign news locally", outcome: "The silence inside the country is absolute. Your people hear only what you want them to, while the rest of the world screams in the dark.", unrest: 20, approval: -20, integrity: -15, nextAct: 22 },
              { text: "Expose coalition war crimes", outcome: "The images you leak shock the international community. Support for the 'intervention' begins to crumble at home.", integrity: 18, tension: 10, approval: 10, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.5', title: 'The Exile',
            body: 'You left the summit. You are now a global pariah with an international arrest warrant.',
            choices: [
              { text: "Rule from the shadows", outcome: "You remain the master of the shadows. The occupation will find that your influence is everywhere, even if the palace is empty.", unrest: 18, integrity: -25, approval: -10, nextAct: 22 },
              { text: "Turn yourself in", outcome: "You choose the path of the martyr. Your arrest is broadcast live, sparking a global debate on the legitimacy of the intervention.", integrity: 25, approval: 15, unrest: -50, nextAct: 22 },
              { text: "Declare a 'Holy War'", outcome: "The fire of your rhetoric ignites a thousand smaller conflicts across the globe. You have successfully turned a local crisis into a worldwide crusade.", tension: 30, ideology: 18, integrity: -20, nextAct: 22 },
              { text: "Seek asylum elsewhere", outcome: "You save your skin with the people's gold. The exile is comfortable, but the guilt of abandonment is a permanent shroud.", unrest: -25, approval: -15, party: -20, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.6', title: 'The Puppet',
            body: 'You are part of the new Transition Council, but you have no vote on the most important decisions.',
            choices: [
              { text: "Build a loyalist shadow bloc", outcome: "A quiet consensus. The shadow bloc ensures that your followers remain in key positions, waiting for the first sign of occupation fatigue.", unrest: 15, party: 18, integrity: -15, nextAct: 23 },
              { text: "Publicly criticize the Council", outcome: "Your voice is the only one speaking for the old nation. The crowd outside the palace gathers whenever you appear.", approval: 18, unrest: -18, tension: 10, nextAct: 23 },
              { text: "Use your intel to influence them", outcome: "You trade what you know for what you need. The coalition is more efficient now, but they are also more dependent on your cooperation.", integrity: 15, unrest: 12, empathy: -10, nextAct: 23 },
              { text: "Focus on rebuilding the capital", outcome: "The capital begins to breathe again. You have saved the bricks and mortar of the city, even if the soul of the nation is still in chains.", eco: 15, approval: 12, unrest: -15, nextAct: 23 }
            ]
          },
          {
            tag: 'ACT III.7', title: 'The Security Pact',
            body: 'The pact allows foreign troops into your palace. They are monitoring your every meeting.',
            choices: [
              { text: "Enforce strict conduct rules", outcome: "The foreign soldiers are disciplined, but their presence is a constant reminder of your lost sovereignty and the cost of peace.", unrest: 15, tension: -20, integrity: 10, nextAct: 23 },
              { text: "Create a restricted 'Green Zone'", outcome: "The city is divided by concrete and wire. You have created a miniature version of the global conflict right in your own backyard.", unrest: 18, integrity: -15, eco: -10, nextAct: 23 },
              { text: "Propose a smaller force", outcome: "A compromise is reached. The lighter footprint of the coalition makes the occupation feel more like a partnership, buying you a fragile peace.", tension: -12, integrity: 12, approval: 8, nextAct: 23 },
              { text: "Demand a withdrawal date", outcome: "The deadline is set. You have bought a future for your country, provided you can survive the wait until the last foreign boots leave.", tension: 15, unrest: 12, integrity: -10, nextAct: 23 }
            ]
          },
          {
            tag: 'ACT III.8', title: 'The Bribe Leak',
            body: 'The bribe was discovered. Your domestic rivals are calling for an immediate audit of the treasury.',
            choices: [
              { text: "Claim the funds were 'covert aid'", outcome: "The lie is accepted by the desperate, but the international community adds 'corrupt' to your list of titles in the history books.", integrity: -15, approval: 8, tension: 10, nextAct: 23 },
              { text: "Confess and blame the treasurer", outcome: "The treasurer goes to prison, and you stay in the palace. The administration is safe, but it is lonelier than ever.", integrity: 18, party: -15, empathy: -12, nextAct: 23 },
              { text: "Use state funds to fix the ledger", outcome: "The books are balanced with the people's sweat. You have saved the treasury by draining the nation's hope.", eco: -18, integrity: -22, unrest: 10, nextAct: 23 },
              { text: "Ignore the audit; focus on war", outcome: "The sirens drown out the auditors. You have successfully delayed the truth with the noise of war, but the truth is still coming.", unrest: 18, approval: -15, party: -15, nextAct: 23 }
            ]
          },
          {
            tag: 'ACT III.9', title: 'The Resistance',
            body: 'Street fighting has broken out against the "Peacekeepers." Your troops are losing the city center.',
            choices: [
              { text: "Fortify the palace district", outcome: "The palace becomes a fortress of marble and iron. You are safe, but you rule a capitol of smoking ruins.", unrest: 25, approval: -25, empathy: -15, nextAct: 21 },
              { text: "Request a localized ceasefire", outcome: "The firing stops in the city center. For a moment, the silence is more terrifying than the noise of the guns.", tension: -18, unrest: -18, approval: 10, nextAct: 21 },
              { text: "Recruit civilian volunteers", outcome: "The people step into the line of fire. Their bravery is absolute, but their mortality is staggering.", approval: 18, empathy: -25, courage: 15, nextAct: 21 },
              { text: "Abandon the city for the south", outcome: "You leave the capitol to the invaders. The fight continues in the mountains, but the nation's heart has been pierced.", eco: -22, approval: -20, unrest: -15, nextAct: 21 }
            ]
          },
          {
            tag: 'ACT III.10', title: 'The Guest',
            body: 'Foreign troops are looting your museums under the guise of "protecting" them from the war.',
            choices: [
              { text: "Demand an inventory of assets", outcome: "You stand up for the nation's heritage. The coalition is shamed into returning the artifacts, or at least stopping the theft.", courage: 20, tension: 12, integrity: 10, nextAct: 23 },
              { text: "Charge 'maintenance fees'", outcome: "A pragmatist's victory. You have turned the theft of your history into a stream of revenue for the resistance.", eco: 18, tension: 15, integrity: -15, nextAct: 23 },
              { text: "Organize silent public protests", outcome: "The people gather in the squares, holding pictures of what has been taken. The world's cameras capture their quiet, absolute grief.", approval: 18, eco: -15, tension: 10, nextAct: 23 },
              { text: "Request their relocation", outcome: "You ensure the treasures are safe in a neutral third country. They are gone from your land, but at least they are safe from the fire.", unrest: -20, integrity: 12, approval: -10, nextAct: 23 }
            ]
          },
          {
            tag: 'ACT III.11', title: 'The UN Stalemate',
            body: 'The UN has issued a "Stay of Action," but the coalition is ignoring it and continuing their advance.',
            choices: [
              { text: "Denounce the UN's weakness", outcome: "Your words are a clarion call to every small nation fearing the same fate. You have no allies, but you have the world's respect.", integrity: -18, approval: 15, tension: 10, nextAct: 22 },
              { text: "Hire private military contractors", outcome: "The contractors arrive in unmarked jets. They are efficient and brutal, caring little for the laws of war.", eco: -20, unrest: 15, party: -12, nextAct: 22 },
              { text: "Announce a 'Defense Act'", outcome: "The nation is now a military machine. Every citizen is a part of the firewall against the coalition's advance.", tension: 20, courage: 20, eco: -15, nextAct: 22 },
              { text: "Host the Secretary-General", outcome: "The world's chief diplomat walks through the ruins of your capital. For a moment, the guns are silent in honor of the talk.", integrity: 18, unrest: -15, tension: -10, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.12', title: 'The Black Smoke',
            body: 'You burned the oil. The world is in an energy crisis, and the sky over the capital is black with soot.',
            choices: [
              { text: "Offer 'reclamation' rights", outcome: "You trade the scorched earth for a seat at the table. The coalition's engineers move in to clean the mess you made.", integrity: 15, eco: -18, tension: 10, nextAct: 22 },
              { text: "Shift to nuclear immediately", outcome: "The nation leapfrogs a century of progress out of sheer necessity. You have energy, but you are now a nuclear-reliant state under a global radar.", eco: -22, approval: 12, tension: 10, nextAct: 22 },
              { text: "Blame the coalition's bombing", outcome: "You win the propaganda war in the soot-filled streets. Every person breathing the black air now has a reason to hate the invader.", integrity: -18, approval: 10, tension: 10, nextAct: 22 },
              { text: "Use the crisis to force a deal", outcome: "The world's lights are flickering because of your fires. You have a leverage that no amount of tanks can overcome.", eco: 15, tension: 15, unrest: -10, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.13', title: 'The Nuclear Shadow',
            body: 'The world knows your silos are active. Panic has caused global markets to halt.',
            choices: [
              { text: "Issue a 'No-First-Use' pledge", outcome: "The nuclear tension drops significantly. You have shown the world that you are still the guardian of the future, even in the dark.", tension: -30, integrity: 25, unrest: -10, nextAct: 21 },
              { text: "Put the military on high alert", outcome: "The world prepares for the end of history. Both sides have their fingers on the red buttons, waiting for the first sign of movement.", tension: 30, unrest: 22, courage: 15, nextAct: 21 },
              { text: "Demand a 1-on-1 with the enemy", outcome: "You bypass the generals and the diplomats to speak directly to the man behind the invasion. One last chance for sanity.", integrity: 22, courage: 30, tension: -10, nextAct: 21 },
              { text: "Disable long-range targeting", outcome: "A silent, absolute gesture of peace. You have removed your own teeth to ensure the world continues to have a heartbeat.", tension: -40, unrest: -30, approval: 10, nextAct: 21 }
            ]
          },
          {
            tag: 'ACT III.14', title: 'The Ceasefire',
            body: 'A fragile truce is in place. Both sides are using the time to dig trenches and reinforce positions.',
            choices: [
              { text: "Build permanent fortifications", outcome: "The ceasefire line becomes a scar across the nation. You have traded a dynamic war for a frozen conflict.", unrest: 15, eco: -18, tension: 10, nextAct: 22 },
              { text: "Train a new wave of recruits", outcome: "The pause is used for preparation. Every citizen is being taught how to fight for the streets when the silence inevitably ends.", unrest: 12, courage: 12, eco: -15, nextAct: 22 },
              { text: "Host cultural exchange events", outcome: "A desperate attempt at humanity. For a moment, soldiers from both sides share music and stories across the barricades.", integrity: 15, approval: 12, party: -12, nextAct: 22 },
              { text: "Start secret back-channel talks", outcome: "The real war is now happening in the shadows of the truce. You are negotiating for a future that no one else can see yet.", integrity: 18, tension: -15, party: -15, nextAct: 22 }
            ]
          },
          {
            tag: 'ACT III.15', title: 'The Mountain',
            body: 'You are ruling from a bunker. The public feels abandoned and a shadow government is forming.',
            choices: [
              { text: "Broadcast daily talks", outcome: "A disembodied voice from the mountain. You are the nation's heart, even if its eyes can no longer find you.", approval: 18, unrest: 12, courage: -10, nextAct: 23 },
              { text: "Invite the cabinet to the bunker", outcome: "The full weight of the state is now compressed into a few miles of concrete. Every decision is made with the echoes of the mountain.", party: 15, unrest: 15, eco: -10, nextAct: 23 },
              { text: "Lead a daring supply run", outcome: "The President at the wheel of a food truck. Your courage is absolute, and for once, the people see the man, not the title.", approval: 15, courage: 25, unrest: -15, nextAct: 23 },
              { text: "Hand over power to VP", outcome: "The quietest path. You step aside to let a new leader face the fire, while you remain in the safety of the dark.", unrest: -25, party: 18, approval: -10, nextAct: 23 }
            ]
          },
          {
            tag: 'ACT III.16', title: 'The People\'s Wall',
            body: 'Your civilian guard is massive, but they have no training and few weapons.',
            choices: [
              { text: "Focus on asymmetric sabotage", outcome: "The occupation will find that every light switch and every engine in the city is a potential trap.", approval: 15, eco: -15, tension: 15, nextAct: 21 },
              { text: "Use the guard for disaster relief", outcome: "The people step into the line of fire to save each other. Their bravery is the only thing keeping the city from a total collapse.", approval: 20, empathy: 18, unrest: -15, nextAct: 21 },
              { text: "Request foreign trainers", outcome: "You bring in the experts of the shadows. The civilian guard is now a professional resistance force in the making.", integrity: 15, tension: 15, unrest: -10, nextAct: 21 },
              { text: "Transition to civil service", outcome: "The guard becomes the new administration in the ruins. You have saved the city's structure, even if its defense is gone.", unrest: 15, eco: -12, approval: 10, nextAct: 21 }
            ]
          },
          {
            tag: 'ACT IV', title: 'Scenario A: The Last Stand',
            body: 'The coalition’s lead tanks are visible from the palace windows. The capital is a fortress of barricades. Your generals are waiting for the order to turn every apartment block into a nest of resistance.',
            choices: [
              { text: "Arm the civilian volunteers", outcome: "The drums of war are no longer distant. You have chosen the path of blood and iron, arming your people for a final, desperate stand.", unrest: 20, approval: 18, empathy: -30, courage: 25, nextAct: 24 },
              { text: "Declare the capital an 'Open City'", outcome: "You choose the silence of the brave. You spare the city from destruction at the cost of its pride and its defenses.", approval: 25, unrest: -30, tension: -20, eco: 15, nextAct: 24 },
              { text: "Sabotage all key infrastructure", outcome: "You turn the city into a skeleton. The victors will inherit only ghosts and cold stone, and your legacy is one of scorched earth.", eco: -40, tension: 20, unrest: 15, courage: 18, nextAct: 24 },
              { text: "Broadcast a final plea for mercy", outcome: "Your voice is the only thing left of the nation. The world watches as you ask for a peace that your own generals cannot accept.", approval: 20, integrity: 25, unrest: -25, courage: -15, nextAct: 24 }
            ]
          },
          {
            tag: 'ACT IV', title: 'Scenario B: The Managed Collapse',
            body: 'The war has reached a point of total exhaustion. The coalition’s economies are buckling under the cost of the invasion, and your own country is running on fumes.',
            choices: [
              { text: "Sign a 'Peace with Honor' treaty", outcome: "The signature is a heavy one, but it is final. The guns are silent, and though the flag is smaller, it still flies over the capital.", tension: -40, unrest: -25, integrity: 20, party: -20, nextAct: 24 },
              { text: "Nationalize all foreign assets", outcome: "You take back what was stolen. The coalition is furious, but they are too exhausted to mount another invasion to reclaim their gold.", eco: 30, integrity: -40, party: 20, tension: 15, nextAct: 24 },
              { text: "Propose a neutral 'Buffer Zone'", outcome: "A geography of peace. You have successfully separated the combatants with a line that might hold for a generation.", integrity: 25, tension: -25, unrest: -15, approval: 10, nextAct: 24 },
              { text: "Form a new regional alliance", outcome: "The old world is gone. You have built a new wall with new friends, turning your back on the coalition once and for all.", integrity: 20, tension: 30, approval: 15, eco: -20, nextAct: 24 }
            ]
          },
          {
            tag: 'ACT IV', title: 'Scenario C: The Puppet Regency',
            body: 'You are essentially a prisoner in the Oval Office. Foreign "advisors" stand behind every door. They have drafted a series of laws for you to sign that effectively dissolve your nation\'s sovereignty.',
            choices: [
              { text: "Delay their orders via red tape", outcome: "You turn the law into a labyrinth. The advisors are frustrated by the slow pace of their take-over, buying you another week to plot.", unrest: 15, integrity: -20, party: 20, approval: 10, nextAct: 24 },
              { text: "Publicly endorse the Plan", outcome: "You sign away the nation. The coalition is pleased, but the silence from your own people is heavy with the weight of cold betrayal.", approval: -40, tension: -30, unrest: -40, integrity: 20, nextAct: 24 },
              { text: "Leak their directives to the press", outcome: "The truth is out. The global public sees the coalition's real face, and for once, the invaders are the ones on the defensive.", integrity: 30, unrest: -20, approval: 20, courage: 15, nextAct: 24 },
              { text: "Pivot military to 'Internal Security'", outcome: "You turn the military inward. The city is orderly, but the cost is a nation that has become its own prison warden.", unrest: 25, tension: -20, eco: -18, approval: -20, nextAct: 24 }
            ]
          },
          {
            tag: 'ACT V', title: 'The Final Ultimatum',
            get body() {
              return gs.bars.internationalTension < 50 ? 'The coalition has withdrawn. The global heat is cooling, and the guns are silent.' : 'The coalition forces are at the threshold of the capital. In your left hand is a pen to sign the unconditional surrender. In your right hand is the nuclear briefcase.';
            },
            get choices() {
              if (gs.bars.internationalTension < 50) return [{ text: "The Peacemaker Ending.", outcome: "You have successfully cooled the fires of global war. The name of your nation will be remembered not for the bombs it dropped, but for the peace it ensured.", nextAct: 999 }];
              return [
                {
                  text: "WAGE WAR",
                  outcome: gs.bars.publicApproval > 50 ? "ENDING: The Warmonger. The people unite behind your strength. You lead them into a glorious, terrible conflict that reshapes the world in your image." : "ENDING: The Impeached. The military refuses your order. You are dragged from the Oval Office as a criminal as the people cheer your removal.",
                  nextAct: 999,
                  onSelect: () => { if (gs.bars.publicApproval <= 50) gs.impeached = true; }
                },
                {
                  text: "STAY PEACEFUL",
                  outcome: gs.bars.publicApproval > 50 ? "ENDING: The Peacemaker. You stood firm against the tide of hate. You are remembered as the savior of the century who spared the world from ash." : "ENDING: The Pacifist. You choose peace, but the people choose a new leader. You resign in a quiet, hollow ceremony, forgotten by the nation you saved.",
                  nextAct: 999
                }
              ];
            }
          }
        ]
      },
      {
        id: 'the_scandal', name: 'The Scandal', trigger: () => gs.bars.partyLoyalty < 30 && (Math.random() < ((10 + (30 - gs.bars.partyLoyalty)) / 100)), acts: [
          {
            // ACT INDEX 0 - ACT 1: The Initial Breach
            tag: 'ACT I', title: 'The Initial Breach',
            body: 'A former aide\u2014someone you once considered family\u2014is about to leak evidence that you authorized illegal surveillance on your political rivals before taking office. They aren\'t asking for money; they want a full, televised public confession.',
            choices: [
              {
                text: 'Release a dossier "proving" the aide is mentally unstable',
                outcome: 'Your intelligence contacts leak fabricated medical records and personal history to the press. The media focuses on the aide\'s "breakdown" rather than your crimes, but you have effectively ruined a former friend\'s life to save your own.',
                unrest: 6, approval: 4, party: -5, empathy: -9, integrity: -9, courage: -5,
                nextAct: 1
              },
              {
                text: 'Offer to pay for their relative\'s medical care in exchange for an NDA',
                outcome: 'A "Blind Trust" quietly funnels money to the aide\'s family, framed as a "charitable gift." The leak is stopped for now, but you have turned a moral plea into a dirty financial transaction that leaves a paper trail.',
                eco: -8, party: -4, integrity: -9, empathy: 3, ideology: -5, courage: -5,
                nextAct: 2
              },
              {
                text: 'Go on live television and admit to the surveillance tonight',
                outcome: 'You go on live television and admit to the surveillance, calling it a "lapse in judgment." You regain your moral standing and the public respects the honesty, but you have handed your enemies the exact evidence they need to remove you.',
                integrity: 9, approval: 7, party: -8, unrest: -8, empathy: 8, courage: 9,
                nextAct: 3
              },
              {
                text: 'Classify the evidence as "Top Secret" and detain the aide',
                outcome: 'You sign an executive order classifying the aide\'s information as "Top Secret" and have them taken into protective custody by federal agents. You successfully suppress the truth, but you have officially bypassed the law to silence a citizen, moving the nation toward a police state.',
                unrest: 9, approval: -8, integrity: -9, empathy: -7, ideology: 8, courage: 4,
                nextAct: 4
              }
            ]
          },
          {
            // ACT INDEX 1 - ACT 2.1: The Backfire (from Path 1)
            tag: 'ACT II \u00b7 THE BACKFIRE', title: 'The Skeleton Speaks',
            body: 'Your smear campaign worked, but the aide\'s family released a "dead man\'s switch" video of you laughing about the spying. The public is turning into an angry mob.',
            choices: [
              {
                text: 'Claim the video is a Deepfake',
                outcome: 'Your partisans believe you, but tech experts publicly debunk the claim, shattering your international credibility. The world now knows you will lie to their faces.',
                approval: 5, integrity: -9, ideology: 7, courage: -6,
                nextAct: 5
              },
              {
                text: 'Fire your Press Secretary as a scapegoat',
                outcome: 'You dodge the immediate headline, but the Secretary goes to the FBI with everything they know in revenge. You have created your most dangerous enemy.',
                party: -8, approval: 4, empathy: -7, courage: -5,
                nextAct: 6
              },
              {
                text: 'Admit the video is real but "out of context."',
                outcome: 'The public views this as a pathetic excuse, and your approval drops as late-night hosts mock your explanation relentlessly.',
                approval: -8, integrity: 7, unrest: -6, courage: 5,
                nextAct: 7
              },
              {
                text: 'Order a police raid to seize the original footage',
                outcome: 'You get the hardware, but the footage of the raid leaks anyway, making you look like a tin-pot dictator stomping on freedom of the press.',
                unrest: 9, approval: -9, tension: 8, empathy: -9,
                nextAct: 8
              }
            ]
          },
          {
            // ACT INDEX 2 - ACT 2.2: The Blackmail (from Path 2)
            tag: 'ACT II \u00b7 THE BLACKMAIL', title: 'The Price of Silence',
            body: 'The aide took the money, but Party Elders found the paper trail. They demand you pass a law deregulating their donors\' industries or they will expose the bribe.',
            choices: [
              {
                text: 'Sign the corrupt law to buy silence',
                outcome: 'The Elders bury the evidence, but the resulting market chaos draws the eye of federal investigators who are far less corruptible than your party bosses.',
                eco: 8, integrity: -9, party: 7, ideology: 6,
                nextAct: 9
              },
              {
                text: 'Threaten the Elders with IRS audits',
                outcome: 'You create a stalemate of fear, but you lose all legislative support as the party turns against you in secret. Every vote is now a battle.',
                unrest: 8, party: -9, integrity: -7, courage: 6,
                nextAct: 10
              },
              {
                text: 'Go public about the Party\'s own corruption',
                outcome: 'You spark a civil war within your own government, leaving you popular with the public mob but politically isolated. You have burned the house to save yourself.',
                party: -9, integrity: 9, approval: 8, courage: 9,
                nextAct: 11
              },
              {
                text: 'Resign from the Party and stay as an Independent',
                outcome: 'You are freed from their demands as an Independent, but you now have zero allies to help you pass a budget or any legislation whatsoever.',
                party: -9, unrest: -8, approval: 7, ideology: 9,
                nextAct: 12
              }
            ]
          },
          {
            // ACT INDEX 3 - ACT 2.3: The Impeachment (from Path 3)
            tag: 'ACT II \u00b7 THE IMPEACHMENT', title: 'The Inquiry Begins',
            body: 'Your confession triggered an Impeachment Inquiry. The Party is split: some want to save you, others want you gone to save the next election.',
            choices: [
              {
                text: 'Rally your populist base to protest',
                outcome: 'Thousands surround the Capitol to protect you, but the threat of political violence reaches a breaking point that cannot be walked back.',
                approval: 9, unrest: 8, tension: 9, empathy: -6,
                nextAct: 13
              },
              {
                text: 'Offer to serve only one term for no trial',
                outcome: 'The inquiry slows, but you are instantly a "lame duck" with no real power for the rest of your term. Your own Cabinet stops returning your calls.',
                unrest: -9, integrity: 7, party: -6, courage: -7,
                nextAct: 14
              },
              {
                text: 'Appoint a rival as VP to "balance" power',
                outcome: 'You stop the trial, but your new VP is already meeting with your Cabinet to discuss your removal using the 25th Amendment.',
                party: 8, unrest: -8, integrity: 7, approval: -5,
                nextAct: 15
              },
              {
                text: 'Challenge the Inquiry in the Supreme Court',
                outcome: 'You tie the process up in legal knots, but the nation\'s highest court is now your final judge. Whatever they decide, will be final.',
                unrest: 7, integrity: -6, tension: 5, courage: 8,
                nextAct: 16
              }
            ]
          },
          {
            // ACT INDEX 4 - ACT 2.4: The Whistleblower (from Path 4)
            tag: 'ACT II \u00b7 THE WHISTLEBLOWER', title: 'The Secret Prison',
            body: 'Intelligence agents holding the aide have leaked information about the detention site. A Senator is calling for a human rights inspection of the "Secret Prison."',
            choices: [
              {
                text: 'Block the Senator via Executive Privilege',
                outcome: 'You keep the site hidden, but the Senator launches a massive media campaign against your "tyranny" that reaches every corner of the globe.',
                unrest: 9, approval: -8, integrity: -8, courage: 7,
                nextAct: 17
              },
              {
                text: 'Move the aide to an offshore black site',
                outcome: 'The prisoner disappears completely from official records, but the international community begins formally investigating you for war crimes.',
                unrest: 8, tension: 7, empathy: -9, integrity: -9,
                nextAct: 18
              },
              {
                text: 'Release the aide and claim a "clerical error."',
                outcome: 'The immediate pressure vanishes with a single press release, but the aide immediately files a massive lawsuit against you personally.',
                approval: 7, unrest: -9, integrity: -6, courage: -8,
                nextAct: 19
              },
              {
                text: 'Accuse the Senator of Treason',
                outcome: 'You rally your base against a "traitor," but you have declared war on the only branch of government that can legally check your power.',
                unrest: 9, approval: -7, tension: 8, ideology: 8,
                nextAct: 20
              }
            ]
          },
          {
            // ACT INDEX 5 - ACT 3.1: The Tech Conflict (from 2.1-1)
            tag: 'ACT III \u00b7 THE TECH CONFLICT', title: 'The Proof Is Real',
            body: 'Silicon Valley experts have unanimously proven the video is authentic. The public is calling for your head and the streets are beginning to fill.',
            choices: [
              {
                text: 'Accuse the tech companies of a partisan conspiracy',
                outcome: 'Your base rallies against "Big Tech" as the enemy, but the media labels you a paranoid autocrat and international credibility crumbles.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Claim the video was a "war game" simulation',
                outcome: 'The public is skeptical but temporarily calmed, though the Intelligence community is deeply insulted by the absurd cover story.',
                integrity: -9, approval: 5, unrest: -8,
                nextAct: 999
              },
              {
                text: 'Impose a city-wide curfew to stop the riots',
                outcome: 'Order returns to the streets at the end of a bayonet, turning you into a global pariah and a cautionary tale for democracies worldwide.',
                unrest: 9, approval: -9, eco: -9,
                nextAct: 999
              },
              {
                text: 'Fire the Director of Intelligence as the "true" mastermind',
                outcome: 'You gain a temporary reprieve by making the Director the scapegoat, but the Intelligence agency becomes your silent and permanent enemy.',
                party: -9, approval: 8, integrity: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 6 - ACT 3.2: The Secretary's Stand (from 2.1-2)
            tag: 'ACT III \u00b7 THE SECRETARY\'S STAND', title: 'Testifying Right Now',
            body: 'Your former Press Secretary is sitting across from the FBI right now, and everything they know about you is coming out.',
            choices: [
              {
                text: 'Grant a full pardon to the Secretary tonight',
                outcome: 'The legal threat vanishes instantly with a single signature, but the blatant cronyism shatters whatever remained of your administration\'s integrity.',
                integrity: -9, party: 9, unrest: -9,
                nextAct: 999
              },
              {
                text: 'Release the Secretary\'s private medical records',
                outcome: 'The Secretary\'s personal reputation is destroyed overnight, but the public is horrified by your ruthless and calculated personal attack.',
                unrest: 9, empathy: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Declare the FBI investigation a "National Security Threat."',
                outcome: 'You successfully bury the files under a national security classification, but the power grab triggers a massive constitutional crisis.',
                unrest: 9, integrity: -9, tension: 9,
                nextAct: 999
              },
              {
                text: 'Bribe the lead investigator on the case',
                outcome: 'The investigation goes cold and the files are sealed, but you are now permanently beholden to a corrupt investigator who owns you.',
                eco: -9, integrity: -9, party: 8,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 7 - ACT 3.3: The Moral Vacuum (from 2.1-3)
            tag: 'ACT III \u00b7 THE MORAL VACUUM', title: 'Approval at an All-Time Low',
            body: 'The "Out of Context" excuse has failed completely. Your approval rating is in free fall and the opposition smells blood.',
            choices: [
              {
                text: 'Launch a massive public works project to change the subject',
                outcome: 'The public is delighted by new hospitals and roads, but the sudden drain on the treasury leaves the economy on a knife\'s edge.',
                eco: -9, approval: 9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Dissolve the Congressional Ethics Committee',
                outcome: 'You are finally free from all oversight, but the move marks the definitive and irreversible death of democratic checks and balances.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Accept a formal Censure but refuse to stop the program',
                outcome: 'You survive the political hit with your office intact, but your authority is permanently diminished in the eyes of all your peers.',
                unrest: -9, integrity: 9, party: -9,
                nextAct: 999
              },
              {
                text: 'Replace your Cabinet with loyalist family members',
                outcome: 'Your inner circle becomes an impenetrable fortress of family loyalty, though the government begins to stall badly under their total incompetence.',
                party: -9, unrest: 9, integrity: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 8 - ACT 3.4: The Police State (from 2.1-4)
            tag: 'ACT III \u00b7 THE POLICE STATE', title: 'A Bridge Too Far',
            body: 'The raid on the aide\'s family home was seen as a bridge too far even by your own supporters. Civil rights groups are flooding the courts with lawsuits.',
            choices: [
              {
                text: 'Defend the raid as a search for "stolen state secrets."',
                outcome: 'The raid is legally "justified" by your lawyers, but the bold lie creates a wave of international panic and severe military tension.',
                unrest: 9, approval: -9, tension: 9,
                nextAct: 999
              },
              {
                text: 'Arrest the lawyers representing the aide',
                outcome: 'The lawsuit is paralyzed without legal representation, but the entire legal profession now declares open war on your administration.',
                unrest: 9, integrity: -9, empathy: -9,
                nextAct: 999
              },
              {
                text: 'Use the National Guard to protect the "Peace."',
                outcome: 'You control the physical narrative on the ground, but the sight of armed soldiers standing in newsrooms confirms the public\'s very worst fears.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Pay the aide\'s family a secret $10M settlement',
                outcome: 'The lawsuit and the family disappear quietly from the news cycle, but the "black budget" payment is a ticking time bomb buried in your legacy.',
                eco: -9, integrity: -9, unrest: -8,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 9 - ACT 3.5: The Market Meltdown (from 2.2-1)
            tag: 'ACT III \u00b7 THE MARKET MELTDOWN', title: 'The Stock Market Crashes',
            body: 'The deregulatory law you signed as a favor to the Elders has crashed the stock market. Retirement accounts are evaporating in real time.',
            choices: [
              {
                text: 'Repeal the law and blame the Party Elders',
                outcome: 'The markets begin a slow, painful recovery. But the Party Elders you just betrayed are now actively plotting your removal.',
                eco: 9, party: -9, integrity: 9,
                nextAct: 999
              },
              {
                text: 'Freeze all stock trading indefinitely',
                outcome: 'You stop the immediate panic before it goes global, but the international community now views your country as a completely unstable investment.',
                eco: -9, unrest: 9, approval: -9,
                nextAct: 999
              },
              {
                text: 'Arrest the CEOs of the failing banks for "Sabotage."',
                outcome: 'You are hailed as a populist hero overnight, but the banking sector grinds to a complete halt and credit lines freeze.',
                approval: 9, party: -9, eco: -9,
                nextAct: 999
              },
              {
                text: 'Print $1 Trillion in stimulus to "buy" the market\'s recovery',
                outcome: 'The market rebounds with stunning speed, but hyperinflation immediately begins to eat away at every citizen\'s life savings.',
                eco: -9, approval: 9, integrity: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 10 - ACT 3.6: The Elder's Revenge (from 2.2-2)
            tag: 'ACT III \u00b7 THE ELDER\'S REVENGE', title: 'Bribery Evidence Leaked',
            body: 'The Party Elders have leaked the bribery evidence directly to the press in calculated retaliation. Your face is on every front page.',
            choices: [
              {
                text: 'Seize the bank accounts of the Party Elders',
                outcome: 'Your enemies are bankrupted and rendered powerless, but the move sends a clear signal that no citizen\'s assets are safe from your personal whim.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Claim the bribery evidence was a "Sting Operation."',
                outcome: 'You confuse the public narrative just enough to survive the immediate news cycle, but your credibility as a leader is forever and permanently destroyed.',
                integrity: 9, approval: 8, party: -9,
                nextAct: 999
              },
              {
                text: 'Bribe the editors of the top five news networks',
                outcome: 'The scandal never reaches the airwaves or the public\'s eyes, but the astronomical cost leaves you completely at the mercy of powerful media moguls.',
                eco: -9, integrity: -9, approval: 5,
                nextAct: 999
              },
              {
                text: 'Declare the Elders "Enemies of the State."',
                outcome: 'The Elders are arrested and behind bars within 48 hours, but the political move effectively dismantles the entire two-party system.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 11 - ACT 3.7: The Broken Party (from 2.2-3)
            tag: 'ACT III \u00b7 THE BROKEN PARTY', title: 'The Removal Process Begins',
            body: 'You exposed the Party\'s corruption to the world. Now the very party you belong to has started a formal process to have you removed from office.',
            choices: [
              {
                text: 'Form the "National Patriot Party" tonight',
                outcome: 'You fracture the political landscape permanently, creating a loyal army of true believers but a completely deadlocked government.',
                party: -9, approval: 9, unrest: 9,
                nextAct: 999
              },
              {
                text: 'File a massive lawsuit against the Party Leadership',
                outcome: 'The impeachment process is stalled in the courts indefinitely, but every aspect of the government\'s daily operation is choked by bitter, endless litigation.',
                unrest: 9, integrity: -9, party: -9,
                nextAct: 999
              },
              {
                text: 'Direct the FBI to raid the Party Headquarters',
                outcome: 'You seize the damning evidence needed to destroy your rivals, but the FBI is now seen by the public and the world as your personal "secret police."',
                unrest: 9, integrity: -9, party: -9,
                nextAct: 999
              },
              {
                text: 'Cut off all state funding to the Party\'s home states',
                outcome: 'The political rebels are starved for resources and forced to compromise, but the resulting infrastructure collapse triggers a genuine humanitarian crisis.',
                eco: -9, party: 9, approval: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 12 - ACT 3.8: The Power Struggle (from 2.2-4)
            tag: 'ACT III \u00b7 THE POWER STRUGGLE', title: 'The Legislature Revolts',
            body: 'As an Independent, the legislature has circled the wagons. They are refusing to pass a single bill, budget, or appointment you send them.',
            choices: [
              {
                text: 'Begin governing solely by Executive Decree',
                outcome: 'Laws are finally being enacted, but the legislature is now a useless relic that openly views you as a tyrant. Congress is at war with the White House.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Veto every single bill they send you until they cave',
                outcome: 'The government stops functioning entirely in a standoff of mutual destruction. The country begins to rot from the inside out as essential services collapse.',
                unrest: 9, eco: -9, approval: -9,
                nextAct: 999
              },
              {
                text: 'Use the military to "supervise" the halls of Congress',
                outcome: 'Votes inside Congress are now mysteriously "unanimous" in your favor, but the international community officially recognizes your regime as a military junta.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Bribe individual members of the opposition to defect',
                outcome: 'You have assembled your working majority through greed and coercion, but your administration is now a hollow shell built on shifting, mercenary loyalties.',
                eco: -9, integrity: -9, party: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 13 - ACT 3.9: The Mob Rule (from 2.3-1)
            tag: 'ACT III \u00b7 THE MOB RULE', title: 'The Capitol Is Occupied',
            body: 'Your supporters have stormed and occupied the Capitol Building. The military is outside, waiting for your personal orders on how to respond.',
            choices: [
              {
                text: 'Order the supporters to "peacefully" occupy the building',
                outcome: 'The crowd acts as a human shield that successfully delays the impeachment vote, but the nation teeters on the edge of uncontrollable civic violence.',
                approval: 9, unrest: 9, tension: 9,
                nextAct: 999
              },
              {
                text: 'Declare the protesters "The New Legislature."',
                outcome: 'You effectively bypass the entire elected legislature with a single proclamation, a move the world sees as the total collapse of the constitutional order.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Use the chaos to arrest the opposition leaders',
                outcome: 'Your most dangerous political rivals are taken completely off the board under cover of the chaos, but your own party begins to deeply fear your unchecked power.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Call in the National Guard to "protect" your supporters',
                outcome: 'The military stands between your supporters and the police, cementing your control through raw, unambiguous force. The constitution is now merely a suggestion.',
                unrest: 9, approval: 9, tension: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 14 - ACT 3.10: The Lame Duck (from 2.3-2)
            tag: 'ACT III \u00b7 THE LAME DUCK', title: 'No One Follows Your Orders',
            body: 'You promised to only serve one term to stop the impeachment. Now that single promise has hollowed out your authority. No one is following your orders anymore.',
            choices: [
              {
                text: 'Break the deal and announce you are running for re-election',
                outcome: 'You regain immediate leverage over the party with a single announcement, but your reputation for honesty is permanently and irreparably destroyed.',
                unrest: 9, integrity: -9, party: -9,
                nextAct: 999
              },
              {
                text: 'Fire your entire Cabinet and hire only loyalists',
                outcome: 'All meaningful internal resistance within the executive branch collapses overnight, but the government grinds to a halt under inexperienced and unqualified new leadership.',
                unrest: 9, party: -9, approval: -9,
                nextAct: 999
              },
              {
                text: 'Start an international conflict to force "Unity."',
                outcome: 'The public rallies behind the flag as intended, but the manufactured threat of an actual war puts the entire nation on an anxious war footing.',
                tension: 9, approval: 9, unrest: 9,
                nextAct: 999
              },
              {
                text: 'Use the Treasury to fund "Secret" projects',
                outcome: 'You bypass the paralyzed Cabinet to maintain your real-world influence, but the growing "black budget" creates a massive and unsustainable hole in the economy.',
                eco: -9, unrest: 9, integrity: -9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 15 - ACT 3.11: The VP's Move (from 2.3-3)
            tag: 'ACT III \u00b7 THE VP\'S MOVE', title: 'The 25th Amendment Looms',
            body: 'Your new VP is actively moving to declare you "mentally unfit" via the 25th Amendment. They are counting Cabinet votes as you read this.',
            choices: [
              {
                text: 'Fire the Vice President immediately',
                outcome: 'You stop the coup attempt cleanly in its tracks, but the sudden and dramatic vacancy triggers a chaotic power vacuum throughout the party.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Lock the Cabinet in the bunker for "safety."',
                outcome: 'The VP is unable to gather the necessary signatures without access to the Cabinet, but the "safety" measure is immediately reported as a hostage situation.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Dig up a scandal on the VP to destroy their move',
                outcome: 'The VP\'s public credibility is completely shattered by the leaks, though the public is deeply repulsed by the naked and "dirty" nature of your self-defense.',
                unrest: 9, integrity: -9, approval: 5,
                nextAct: 999
              },
              {
                text: 'Bribe the Cabinet to stay loyal to you',
                outcome: 'The Cabinet chooses personal financial gain over principle, leaving you technically in power but deeply and permanently beholden to subordinates who own you.',
                eco: -9, integrity: -9, party: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 16 - ACT 3.12: The Court Battle (from 2.3-4)
            tag: 'ACT III \u00b7 THE COURT BATTLE', title: 'The Supreme Court Rules Against You',
            body: 'The Supreme Court has ruled unanimously against you. You must stand trial before the American people.',
            choices: [
              {
                text: 'Refuse to recognize the Court\'s authority',
                outcome: 'You maintain your position in the office by sheer force of will and physical presence, but the entire legal community and the public declare you a rogue dictator.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Add six new loyalist judges to the Court',
                outcome: 'You secure favorable future rulings by stacking the court with allies, but the move triggers a wave of mass resignations across the entire federal judiciary.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Have the Chief Justice investigated for "corruption."',
                outcome: 'The judge who ruled against you is silenced and sidelined by the investigation, though the public sees the DOJ action as a blatant and terrifying abuse of power.',
                unrest: 9, integrity: -9, courage: 9,
                nextAct: 999
              },
              {
                text: 'Suspend the Court "until the crisis is over."',
                outcome: 'You eliminate every remaining legal obstacle standing between you and absolute power, but the international community officially and publicly condemns your regime.',
                unrest: 9, approval: -9, tension: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 17 - ACT 3.13: The Senator's Stand (from 2.4-1)
            tag: 'ACT III \u00b7 THE SENATOR\'S STAND', title: 'Chained to the Prison Gates',
            body: 'The Senator has physically chained themselves to the gates of the facility where the aide is held. The press is camped outside with cameras rolling.',
            choices: [
              {
                text: 'Use fire hoses to "disperse" the Senator and the press',
                outcome: 'The path is physically cleared, but the footage of an elderly Senator being blasted by fire hoses becomes a defining symbol of your cruelty worldwide.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Arrest the Senator for "interference with a secure facility."',
                outcome: 'The protest ends immediately with the Senator in handcuffs, but your own party begins to visibly revolt over the dramatic arrest of one of their own.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Declare the prison grounds a "No-Fly Zone" for the media',
                outcome: 'The Senator\'s message is effectively muffled behind a wall of silence, but the blatant media censorship triggers a massive and unified backlash from the free press.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Relocate the aide to a secret location tonight',
                outcome: 'The Senator is left chanting into an empty building by sunrise, but the complete "disappearance" of the aide creates an even larger and more dangerous new scandal.',
                unrest: 9, integrity: -9, courage: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 18 - ACT 3.14: The War Crimes Inquiry (from 2.4-2)
            tag: 'ACT III \u00b7 THE WAR CRIMES INQUIRY', title: 'The World Is Watching',
            body: 'The international community has formally opened a war crimes investigation into the offshore detention of the aide. Allied nations are demanding answers.',
            choices: [
              {
                text: 'Refuse all international inspectors',
                outcome: 'You maintain total information blackout around the facility, but economic sanctions from allies begin to bite and foreign investment collapses.',
                unrest: 9, tension: 9, eco: -9,
                nextAct: 999
              },
              {
                text: 'Release the aide and blame your Intelligence Chief',
                outcome: 'The immediate international heat begins to cool with the release, but your own intelligence community now views you as a dangerous liability they must manage.',
                approval: 7, unrest: -7, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Classify the aide as a "Captured Enemy Combatant"',
                outcome: 'You successfully reframe the offshore detention as a legitimate national security measure, but global human rights organizations rally every major government against you.',
                unrest: 8, integrity: -9, tension: 8,
                nextAct: 999
              },
              {
                text: 'Propose an independent inquiry that you control',
                outcome: 'You appear transparent and cooperative on the surface, but the transparently rigged inquiry destroys any last shred of international institutional trust in your government.',
                approval: 5, integrity: -9, ideology: 8,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 19 - ACT 3.15: The Legal War (from 2.4-3)
            tag: 'ACT III \u00b7 THE LEGAL WAR', title: 'The Lawsuit Is Filed',
            body: 'You admitted to the "clerical error," but the aide has filed a massive personal lawsuit against you for unlawful detention and cruel treatment.',
            choices: [
              {
                text: 'Use state funds to hire every top lawyer in the country',
                outcome: 'The lawsuit is buried in procedural motions and successfully delayed for years, but the obscene taxpayer expense triggers a wave of furious populist anger.',
                eco: -9, unrest: -8, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Intimidate the witnesses in the civil case',
                outcome: 'The aide\'s case collapses without witnesses willing to testify, but federal agents are now permanently viewed as your personal "enforcement" squad for hire.',
                unrest: 9, integrity: -9, empathy: -9,
                nextAct: 999
              },
              {
                text: 'Sign a law granting the President "Total Immunity" from lawsuits',
                outcome: 'You become completely and legally untouchable with a single stroke of the pen, but the signing marks the definitive and official end of the rule of law in America.',
                unrest: 9, integrity: -9, ideology: 9,
                nextAct: 999
              },
              {
                text: 'Claim the lawsuit is a "foreign-funded" plot',
                outcome: 'The public anger turns sharply against the aide as a perceived foreign agent, but the manufactured accusation seeds a permanent atmosphere of xenophobia and civic fear.',
                approval: 9, integrity: -9, tension: 9,
                nextAct: 999
              }
            ]
          },
          {
            // ACT INDEX 20 - ACT 3.16: The Treason Charge (from 2.4-4)
            tag: 'ACT III \u00b7 THE TREASON CHARGE', title: 'The World Demands a Fair Trial',
            body: 'You publicly accused the Senator of treason. Every major democracy in the world is demanding you provide a transparent and fair public trial.',
            choices: [
              {
                text: 'Hold a closed-door military tribunal',
                outcome: 'You secure the guilty verdict you need without any public interference, but the complete secrecy of the proceedings confirms to the world that you have abandoned democracy.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Present fabricated "evidence" of the Senator\'s guilt',
                outcome: 'The staged evidence is convincing enough that the public believes the lie, but your intelligence team now holds enough real "dirt" on you to demand absolutely anything in return.',
                integrity: -9, unrest: 9, courage: 9,
                nextAct: 999
              },
              {
                text: 'Exile the Senator to a neutral country',
                outcome: 'You remove the threat cleanly without the mess of a public trial, but the Senator immediately becomes a uniquely powerful "martyr" whose international platform dwarfs yours.',
                unrest: 9, approval: -9, integrity: -9,
                nextAct: 999
              },
              {
                text: 'Strip the Senator of their voting rights in Congress',
                outcome: 'You effectively silence the most dangerous opposition voice within the legislature itself, but the unprecedented move is seen globally as an illegal seizure of democratic power.',
                unrest: 9, party: -9, integrity: -9,
                nextAct: 999
              }
            ]
          }
        ]
      },
      {
        id: 'revolution', name: 'The Revolution', trigger: () => (gs.lowAuthorityTurns >= 3 || gs.bars.stateAuthority < 20) && gs.bars.publicApproval < 50, acts: [
          {
            tag: 'ACT I', title: 'The Breach',
            body: 'Protesters have occupied the state media building and are broadcasting a list of demands, starting with your immediate resignation. The capital is at a standstill.',
            choices: [
              { text: "Order the military to retake the media building by force.", outcome: "The media building is cleared, but the streets are now a combat zone. The world is watching your response with horror.", unrest: 10, approval: -12, tension: 8, empathy: -10, integrity: -8, courage: 7, nextAct: 1 },
              { text: "Walk out to the gates alone to meet the protest leaders.", outcome: "Your presence at the gates shocks the crowd into silence. For a moment, humanity outweighs politics.", approval: 10, unrest: -10, integrity: 8, empathy: 7, ideology: -4, courage: 15, nextAct: 2 },
              { text: "Declare a State of Emergency and cut the national internet.", outcome: "The lights go out across the nation. The silence is absolute, but the pressure in the streets is reaching a boiling point.", unrest: 9, eco: -10, approval: -8, integrity: -7, ideology: 7, courage: 5, nextAct: 3 },
              { text: "Retreat to the underground bunker and wait for the crowds to tire.", outcome: "You are safe underground, but the nation feels the vacuum of leadership. The Vice President begins to take control.", unrest: -7, approval: -10, party: -8, integrity: -5, ideology: -5, courage: -12, nextAct: 4 }
            ]
          },
          {
            tag: 'ACT II.1', title: 'The Standoff',
            body: 'The media building was retaken, but the images of the confrontation have sparked even larger protests. Your generals are divided on whether to continue the crackdown.',
            choices: [
              { text: "Expand Martial Law", outcome: "The deployment of troops is met with a hail of fire. The city is a war zone, and your control is slipping.", unrest: 12, approval: -12, tension: 10, empathy: -12, nextAct: 5 },
              { text: "Blame the Field Commander", outcome: "You escape personal blame, but the military feels betrayed. A shadow council begins to form in the officer's mess.", party: -8, approval: 4, integrity: -10, courage: -7, nextAct: 6 },
              { text: "Call for an immediate Ceasefire", outcome: "The firing stops, but the tension is thick enough to cut. The people are waiting for a concession.", approval: 7, unrest: -10, integrity: 8, courage: 5, nextAct: 7 },
              { text: "Replace the hesitant Generals", outcome: "The new generals are loyalist hardliners. They promise order, but at a cost that reflects in the mounting casualty lists.", unrest: 10, party: -12, integrity: -9, courage: 9, nextAct: 8 }
            ]
          },
          {
            tag: 'ACT II.2', title: 'The Negotiation',
            body: 'The crowd respected your courage, but their leaders demand a new Charter that strips the Presidency of its veto power and forces early elections.',
            choices: [
              { text: "Sign the Charter", outcome: "You sign away your executive power. The crowd cheers, but the Oval Office feels cavernous and hollow.", approval: 12, unrest: -15, ideology: 8, integrity: 7, nextAct: 9 },
              { text: "Offer a Power-Sharing deal", outcome: "A fragile peace is bought with political compromises. You are no longer the master, but a partner in a divided state.", unrest: -10, approval: 7, party: -8, integrity: 6, nextAct: 10 },
              { text: "Arrest the leaders during the talk", outcome: "The betrayal is total. The screams of the arrested leaders echo through the palace, marking the end of your democratic pretense.", unrest: 10, approval: -15, integrity: -12, courage: 5, nextAct: 11 },
              { text: "Appeal directly to the people", outcome: "Your words reach the hearts of the moderate majority. The radical front is isolated, and the momentum of the revolt stalls.", approval: 9, unrest: -9, integrity: 5, courage: 10, nextAct: 12 }
            ]
          },
          {
            tag: 'ACT II.3', title: 'The Silence',
            body: 'The internet is down, but the general strike is total. Factories and transport are closed, and the silence in the streets is more threatening than the noise.',
            choices: [
              { text: "Seize the radio stations", outcome: "The airwaves are yours, but the people have stopped listening. You are shouting into a graveyard.", unrest: 10, approval: -10, integrity: -9, courage: 7, nextAct: 13 },
              { text: "Restore the internet to negotiate", outcome: "The digital world returns, and with it, a tidal wave of coordination from the resistance. You are now fighting a transparent war.", approval: 9, unrest: -12, integrity: 7, courage: -4, nextAct: 14 },
              { text: "Force workers back with the military", outcome: "The military moves the assembly lines. The economy is alive, but it runs on the bayonets of a conscripted workforce.", unrest: 12, eco: -12, approval: -12, empathy: -10, nextAct: 15 },
              { text: "Bribe the union heads", outcome: "The unions crumble under the weight of your gold. The strike is over, but the workers' resentment is a ticking bomb.", eco: -12, integrity: -10, party: 7, approval: 4, nextAct: 16 }
            ]
          },
          {
            tag: 'ACT II.4', title: 'The Shadow Council',
            body: 'While you were in the bunker, the Vice President formed a "Stability Council" to manage the crisis, effectively sidelining your authority.',
            choices: [
              { text: "Fire the Vice President", outcome: "The dismissal is seen as a coup. The palace guard is now the only thing between you and a very angry public.", unrest: 10, party: -15, approval: -8, courage: 12, nextAct: 17 },
              { text: "Cooperate with the Council", outcome: "You maintain the title of President, but the Council makes the real calls. You are a ghost in your own house.", unrest: -12, party: 8, approval: 4, integrity: 7, nextAct: 18 },
              { text: "Call the Council illegal", outcome: "The declaration triggers a fracture in the military. Civil war is no longer a threat; it is an active reality.", unrest: 12, tension: 12, integrity: -12, courage: 10, nextAct: 19 },
              { text: "Negotiate a dignified exit", outcome: "The terms are signed. You will leave the Oval with your head held high, though your legacy is forever scarred by the sirens.", approval: 9, unrest: -15, eco: -8, courage: -8, nextAct: 20 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Martial Law Path',
            body: 'You have absolute control of the streets, but the international community is preparing to freeze your national assets.',
            choices: [
              { text: "Defy global sanctions", outcome: "The streets are yours, but at the cost of your soul and your country's future. You are the architect of a silent, fear-filled peace.", tension: 15, eco: -12, unrest: 8, nextAct: 999 },
              { text: "Host a 'Unity' rally", outcome: "The flags wave and the crowds cheer, but the bayonets behind them tell the true story of your victory.", approval: 10, eco: -10, integrity: -8, nextAct: 999 },
              { text: "Cede power to a military council", outcome: "You remain the figurehead, but the generals now hold the keys to the kingdom.", unrest: -15, party: 10, courage: -10, nextAct: 999 },
              { text: "Arrest foreign journalists", outcome: "The truth is smothered, but the silence from the international community is more deafening than any headline.", unrest: 12, tension: 12, integrity: -15, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Scapegoat Path',
            body: 'The Commander you blamed for the violence has leaked proof that they were following your direct orders.',
            choices: [
              { text: "Pardon the Commander", outcome: "The immediate pressure is gone, but the ghost of your betrayed allies will haunt every shadow in the palace.", integrity: -10, party: 10, unrest: -8, nextAct: 999 },
              { text: "Counter-sue for defamation", outcome: "You win in the courts, but you have lost the courtroom of public opinion forever.", unrest: 8, integrity: -12, approval: -5, nextAct: 999 },
              { text: "Resign in the fallout", outcome: "You leave the office with your life, but your legacy is a stack of broken promises and unfinished chapters.", approval: 12, unrest: -15, courage: 10, nextAct: 999 },
              { text: "Suppress the media leak", outcome: "The story is killed, but the truth remains a ticking bomb in the hearts of your staff.", unrest: 10, approval: -12, integrity: -10, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Ceasefire Path',
            body: 'The guns are silent, but the city remains divided by barricades. The people are waiting for a sign of true change.',
            choices: [
              { text: "Build a reconciliation memorial", outcome: "The guns have stopped, but the healing has yet to begin. You have bought time with blood and promises.", empathy: 12, approval: 10, eco: -8, nextAct: 999 },
              { text: "Increase police funding", outcome: "Peace is maintained with a heavy hand. The silence in the streets is a sign of order, not of trust.", unrest: 10, approval: -8, eco: -10, nextAct: 999 },
              { text: "Resign in penance", outcome: "Your departure is the first step toward a national healing you could never lead.", approval: 15, unrest: -20, integrity: 10, nextAct: 999 },
              { text: "Blame the protesters for the deaths", outcome: "You maintain your seat by fanning the flames of division. The country is safe, but it is broken.", unrest: 8, approval: -12, ideology: 10, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The New High Command Path',
            body: 'Your new loyalist generals are ready to move, but they want a permanent seat at the legislative table.',
            choices: [
              { text: "Order a fresh sweep of the capital", outcome: "The generals now sit at your table. You have order, but you no longer hold the gavel.", unrest: 15, approval: -15, tension: 12, nextAct: 999 },
              { text: "Offer the generals seats in the Cabinet", outcome: "The administration is now a military partnership. Your decisions are checked by the weight of the sword.", party: 12, unrest: -10, integrity: -10, nextAct: 999 },
              { text: "Resign under military pressure", outcome: "You are the last President of the old guard. Your successor will wear a uniform.", approval: 10, unrest: -20, courage: -12, nextAct: 999 },
              { text: "Use the army to build infrastructure", outcome: "The military's energy is channeled into construction. The nation is rebuilding, but the uniform is everywhere.", eco: 12, approval: 8, unrest: -8, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Charter Path',
            body: 'The new Charter is active. You are now a figurehead while the new Parliament makes the real decisions.',
            choices: [
              { text: "Support the new democratic laws", outcome: "The new laws are a testament to your restraint—or your failure. History will decide.", approval: 12, unrest: -15, integrity: 10, nextAct: 999 },
              { text: "Quietly veto the first budget", outcome: "You maintain a final grip on power, but the new parliament is already planning your removal.", unrest: 10, approval: -10, eco: -8, nextAct: 999 },
              { text: "Resign and run for Parliament", outcome: "You transition from the master of the house to a member of the chorus. Your influence is diminished, but your life is intact.", party: 12, approval: 8, unrest: -20, nextAct: 999 },
              { text: "Retire from public life", outcome: "You leave the noise behind for a quiet legacy of what-ifs.", approval: 10, integrity: 10, courage: -10, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Power-Sharing Path',
            body: 'The Coalition government is a mess of bickering factions. Nothing is getting done.',
            choices: [
              { text: "Accept the coalition cabinet", outcome: "The nation is a mess of competing voices, and your own is just one among many.", party: 12, unrest: -12, approval: 8, nextAct: 999 },
              { text: "Sabotage the coalition from within", outcome: "By preserving your power, you have ensured the country remains paralyzed by gridlock.", unrest: 10, integrity: -12, party: -10, nextAct: 999 },
              { text: "Resign to let them rule alone", outcome: "You step aside to let the experiment in democracy find its own way, regardless of the outcome.", approval: 12, party: 10, unrest: -15, nextAct: 999 },
              { text: "Appeal for a snap election", outcome: "One final gamble for a mandate. The people will decide if you are the savior or the problem.", approval: 10, unrest: -10, tension: 8, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Arrest Path',
            body: 'You have the protest leaders in custody, but their followers are threatening to storm the prison.',
            choices: [
              { text: "Put the leaders on trial", outcome: "The prison doors are locked, but you have only postponed the next explosion.", unrest: 15, approval: -15, tension: 12, nextAct: 999 },
              { text: "Offer them exile in a neutral country", outcome: "The problem is gone, but the cause remains. You are safe, but the streets are still silent and resentful.", unrest: 10, tension: 10, approval: -10, nextAct: 999 },
              { text: "Claim they were planning a coup", outcome: "The truth is lost in the fog of propaganda. You remain in control, but of a nation that no longer knows what to believe.", integrity: -12, approval: 5, unrest: 8, nextAct: 999 },
              { text: "Release them and resign", outcome: "You choose the path of most resistance—humility. Your name will be remembered in the new history books with respect.", approval: 15, unrest: -30, integrity: 15, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Public Appeal Path',
            body: 'Your appeal worked, splitting the opposition, but the country is now locked in a bitter ideological cold war.',
            choices: [
              { text: "Call for a National Referendum", outcome: "You have won the hearts of some, but the divide in the country is now a permanent scar.", approval: 12, unrest: -10, integrity: 12, nextAct: 999 },
              { text: "Form a Unity Government", outcome: "A government of strangers. You are safe, but your influence is diluted by the very people who tried to remove you.", party: 12, approval: 8, unrest: -8, nextAct: 999 },
              { text: "Resign to end the national divide", outcome: "A final act of patriotism. Your departure is the only thing that can bridge the gap you created.", approval: 15, unrest: -20, empathy: 12, nextAct: 999 },
              { text: "Arrest the rival leaders now", outcome: "The crackdown is complete. You rule a country that is orderly, but utterly broken in spirit.", unrest: 12, approval: -12, tension: 12, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Radio Path',
            body: 'You control the airwaves, but the people have stopped listening. The streets are eerily empty.',
            choices: [
              { text: "Broadcast your own message 24/7", outcome: "Your voice is everywhere, yet no one is listening. You are a king in a kingdom of echoes.", unrest: 10, approval: -10, integrity: -8, nextAct: 999 },
              { text: "Return the stations to the unions", outcome: "You hand back the microphone. The first thing they do is call for your immediate removal.", approval: 12, unrest: -12, party: -10, nextAct: 999 },
              { text: "Resign on air", outcome: "Your final speech is the most honest thing you have said in four years. The country actually pauses to listen.", approval: 15, unrest: -15, courage: 10, nextAct: 999 },
              { text: "Destroy the transmitters", outcome: "If it's not yours, it's no one's. You rule a nation that is both quiet and deaf.", unrest: 12, eco: -10, approval: -12, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Restoration Path',
            body: 'The internet is back, but the first thing people are doing is organizing a march on your residence.',
            choices: [
              { text: "Host a televised town hall", outcome: "The digital world is back, and it is already building the next protest.", approval: 12, integrity: 10, unrest: -10, nextAct: 999 },
              { text: "Use the internet to track dissent", outcome: "You have restored the network, but only to turn it into a surveillance machine. The people's eyes are now on you.", unrest: 15, approval: -15, integrity: -12, nextAct: 999 },
              { text: "Resign after your final speech", outcome: "The internet records your departure in high definition. You are the first President to leave with a viral apology.", approval: 15, unrest: -12, courage: 8, nextAct: 999 },
              { text: "Limit social media access", outcome: "The network is back, but the walls are higher. You rule an island of sanctioned information.", unrest: 10, approval: -12, ideology: 10, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Forced Labor Path',
            body: 'You have forced the workers back, but productivity is at an all-time low and sabotage is everywhere.',
            choices: [
              { text: "Increase military oversight", outcome: "The factories are humming, but the workers' eyes are filled with a cold, quiet fury.", unrest: 15, eco: -10, empathy: -15, nextAct: 999 },
              { text: "Give in to the union demands", outcome: "You surrender to the workers. The factories are productive, but you have lost the support of the industrialists.", eco: -12, approval: 12, party: -12, nextAct: 999 },
              { text: "Resign and let the strike succeed", outcome: "By stepping down, you allow the nation's heart to beat on its own again.", approval: 15, eco: 10, unrest: -25, nextAct: 999 },
              { text: "Import foreign labor", outcome: "The economy is stable, but the social tension between the old and new workers is a fuse you cannot extinguish.", eco: 10, approval: -12, tension: 12, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Bribe Path',
            body: 'The unions are working, but a whistleblower has leaked the bank records of the payouts.',
            choices: [
              { text: "Confess and pay a fine", outcome: "You bought your survival with gold, but your integrity was the real currency.", integrity: 12, approval: 8, eco: -10, nextAct: 999 },
              { text: "Deny all bank records", outcome: "The lie works—for now. But trust is a bridge that has been permanently dismantled.", integrity: -15, approval: -10, unrest: 10, nextAct: 999 },
              { text: "Resign before the leak", outcome: "You choose a quiet exit over a public trial. Your legacy is one of survival, not of strength.", approval: 10, unrest: -15, integrity: 8, nextAct: 999 },
              { text: "Fire the Treasury head as a scapegoat", outcome: "You saved your seat by throwing another in the fire. The administration is safe, but it is lonely at the top.", party: -12, unrest: 8, integrity: -10, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Purge Path',
            body: 'You fired the VP, but now the military is split between those loyal to you and those loyal to the "Constitution."',
            choices: [
              { text: "Dissolve the legislature", outcome: "The rivals are gone, but you have turned the presidency into a fortress of paranoia.", unrest: 15, approval: -20, tension: 15, nextAct: 999 },
              { text: "Form a loyalist-only council", outcome: "You rule a echo chamber. Every decision you make is applauded, while the country outside is screaming.", party: 15, unrest: 10, integrity: -12, nextAct: 999 },
              { text: "Resign under fire", outcome: "The experiment in total control ends with a quiet signature and a fast motorcade to the airport.", approval: 10, unrest: -15, courage: -10, nextAct: 999 },
              { text: "Call for an early election", outcome: "One final gamble for truth. You put your fate in the hands of the very people you have been fighting.", approval: 12, unrest: -10, party: -15, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Cooperation Path',
            body: 'The Stability Council is actually doing a good job. You are starting to look like an unnecessary relic.',
            choices: [
              { text: "Regain influence slowly", outcome: "The Council is the real power now. You are merely the signature on their decrees.", unrest: 10, party: 10, integrity: -8, nextAct: 999 },
              { text: "Sabotage the VP’s meetings", outcome: "By trying to regain your seat, you have only ensured that both you and the VP will lose the trust of the nation.", unrest: 10, integrity: -12, party: -10, nextAct: 999 },
              { text: "Resign and endorse the VP", outcome: "The most graceful exit possible. You leave the office in better hands than your own.", approval: 12, party: 12, unrest: -15, nextAct: 999 },
              { text: "Expose the Council’s secrets", outcome: "You tear the house down with you. The truth is out, but there is no one left to lead.", approval: 10, integrity: 10, party: -15, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Treason Path',
            body: 'By calling the Council illegal, you have triggered a localized civil war between different police and military units.',
            choices: [
              { text: "Arrest the Council members", outcome: "You have won the battle, but the ensuing civil war will haunt your country for generations.", unrest: 15, tension: 15, approval: -15, nextAct: 999 },
              { text: "Call for a referendum on your power", outcome: "A democratic solution to a treasonous problem. The people will decide if you are the legitimate leader or a king in denial.", approval: 12, unrest: -12, integrity: 12, nextAct: 999 },
              { text: "Resign to avoid a coup", outcome: "You choose a quiet retreat over a bloody stand. The Oval remains intact, but your legacy is a stack of unfinished chapters.", approval: 15, unrest: -20, party: -10, nextAct: 999 },
              { text: "Form a rival shadow cabinet", outcome: "You rule a mirror-government in a mirror-country. The nation is now double-visioned and twice as dangerous.", party: 12, unrest: 8, tension: 12, nextAct: 999 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Exit Path',
            body: 'The protesters have agreed to clear the streets if you sign the papers in the next hour.',
            choices: [
              { text: "Sign the papers and go quietly", outcome: "The terms are signed. You will leave the Oval with your head held high, though your legacy is forever scarred by the sirens.", approval: 12, unrest: -25, eco: 8, nextAct: 999 },
              { text: "Demand legal immunity", outcome: "You save your freedom at the cost of your remaining honor. You are free, but you are a man without a country.", integrity: -15, unrest: -12, approval: 8, nextAct: 999 },
              { text: "Delay the exit for one month", outcome: "You buy one more month in the sun, while the shadow of your departure grows longer each day.", unrest: -8, approval: -8, party: -8, nextAct: 999 },
              { text: "Change your mind and stay", outcome: "The ultimate betrayal of the truce. The streets will never be quiet again.", unrest: 15, approval: -15, tension: 15, nextAct: 999 }
            ]
          }
        ]
      },
      {
        id: 'legacy', name: 'The Permanent Record', trigger: () => gs.turn >= 40, acts: [
          {
            tag: 'ACT I', title: 'The Final Address',
            body: 'You are preparing your farewell speech to the nation. How will you define your time in office?',
            choices: [
              { text: 'The "Humble Servant" Speech.', outcome: 'You take responsibility for the scandals and call for national healing, stabilizing the country but appearing weak to your rivals.', approval: 18, unrest: -15, integrity: 12, tension: -10 },
              { text: 'The "Victory Lap" Speech.', outcome: 'You ignore the controversies and claim credit for every success, firing up your base while infuriating the press.', approval: 12, unrest: 15, integrity: -12, party: 10 },
              { text: 'The "Scorched Earth" Speech.', outcome: 'You use your final platform to name every enemy and "traitor" who crossed you, inciting a loyalist movement that outlasts your term.', unrest: 20, approval: -20, party: -15, tension: 15 },
              { text: 'The "Silent Exit."', outcome: 'You refuse to give a speech at all, leaving the public confused and allowing the media to write your story for you.', approval: -10, unrest: -12, integrity: -15, eco: 5 }
            ]
          },
          {
            tag: 'ACT II', title: 'The Midnight Pardons',
            body: 'It is your last night in the White House. Your desk is piled with pardon requests for your most controversial allies.',
            choices: [
              { text: 'Pardon everyone involved in the Scandal Arc.', outcome: 'Your loyalists are safe from prison, but the legal system is left in a state of absolute mockery.', party: 20, integrity: -20, unrest: -10, approval: -15 },
              { text: 'Pardon yourself for any "potential" crimes.', outcome: 'You ensure you can never be prosecuted after you leave, triggering a final constitutional crisis as you walk out the door.', unrest: 18, approval: -18, integrity: -18, tension: 12 },
              { text: 'Refuse all pardons to "Clear the Air."', outcome: 'You leave with your hands clean, but your former allies begin signing book deals to expose your secrets.', integrity: 15, party: -20, approval: 10, unrest: -10 },
              { text: 'Pardon only the "Corporate Donors."', outcome: 'You secure a massive "consulting" salary for your post-presidency life, though the public views it as a final act of corruption.', eco: 20, approval: -15, party: 10, integrity: -12 }
            ]
          },
          {
            tag: 'ACT III', title: 'The Transfer of Power',
            body: 'The President-elect is your bitter rival. They are waiting at the inauguration.',
            choices: [
              { text: 'Attend the inauguration and shake their hand.', outcome: 'You preserve the tradition of a peaceful transition, lowering national tension but losing your "Strongman" image.', tension: -20, approval: 15, unrest: -15, integrity: 10 },
              { text: 'Boycott the ceremony and hold a rival rally.', outcome: 'You split the country\'s attention and maintain your cult of personality, but the nation teeters on the edge of civil unrest.', unrest: 15, approval: -12, tension: 20, party: 12 },
              { text: 'Declassify "The Deep State" files on the way out.', outcome: 'You leak the government’s darkest secrets to the public, crippling your successor\'s ability to govern effectively.', integrity: -20, unrest: -10, approval: 15, tension: 15 },
              { text: 'Declare the election "Fraudulent" one last time.', outcome: 'You leave office under protest, ensuring that half the country views the new government as illegitimate.', unrest: 20, approval: -15, tension: 18, party: -10 }
            ]
          }
        ]
      }
    ];

    // ═══════════════════════════════════════════════════════════
    // ENDINGS
    // ═══════════════════════════════════════════════════════════
    const ENDINGS = [
      { 
        id: 'impeached', title: 'The Impeached', emoji: '⚖️', check: () => gs.impeached, 
        tagline: 'Given the boot.', 
        narrative: 'Your term ended abruptly and in disgrace. The weight of your scandals finally collapsed the government\'s trust, leading to a historic removal from office. You leave behind a legacy of legal battles and a cautionary tale for all who follow.', 
        profile: 'Disgraced' 
      },
      { 
        id: 'warmonger', title: 'The Warmonger', emoji: '⚔️', check: () => gs.arcsCompleted.includes('convergence_route') && gs.bars.internationalTension > 50 && gs.bars.publicApproval >= 50, 
        tagline: 'Victory at any cost.', 
        narrative: 'You defined your presidency through the barrel of a gun. By prioritizing military dominance and aggressive expansion, you turned the nation into a global fortress. You leave office with a powerful army but a world that watches your borders with fear.', 
        profile: 'The Conqueror' 
      },
      { 
        id: 'peacemaker', title: 'The Peacemaker', emoji: '🕊️', check: () => gs.arcsCompleted.includes('convergence_route') && gs.bars.internationalTension <= 50, 
        tagline: 'A bridge over troubled waters.', 
        narrative: 'You spent your term mending fractured alliances and de-escalating global threats. By choosing diplomacy over force, you ensured a generation of stability. You leave behind a world that is significantly quieter and safer than the one you inherited.', 
        profile: 'The Architect of Peace' 
      },
      { 
        id: 'pacifist', title: 'The Pacifist', emoji: '☮️', check: () => gs.arcsCompleted.includes('convergence_route') && gs.bars.internationalTension > 50 && gs.bars.publicApproval < 50, 
        tagline: 'Peace is the only path.', 
        narrative: 'You refused to engage in conflict, even when pressured by your own generals. While some called it weakness, you saved countless lives by keeping the nation out of harm\'s way. You retire with a clean conscience and a nation that has forgotten the sound of war.', 
        profile: 'The Humanitarian' 
      },
      { 
        id: 'tyrant', title: 'The Tyrant', emoji: '👁️', check: () => gs.bars.stateAuthority > 70, 
        tagline: 'Rule with an iron fist.', 
        narrative: 'You didn\'t lead the nation; you broke it to your will. By dismantling the legislature and silencing dissent, you secured absolute control. You leave behind a country that is orderly, terrified, and entirely yours, even after you\'ve stepped down.', 
        profile: 'The Autocrat' 
      },
      { 
        id: 'martyr', title: 'The Martyr', emoji: '🔥', check: () => gs.bars.publicApproval > 75 && gs.bars.partyLoyalty < 20, 
        tagline: 'Sacrificed for the truth.', 
        narrative: 'You chose the people over the party and paid the ultimate political price. By exposing deep-seated corruption, you lost your allies and your wealth. You exit the presidency as a man without a country, but with the eternal gratitude of the public.', 
        profile: 'The Reformer' 
      },
      { 
        id: 'populist', title: 'The Populist', emoji: '📣', check: () => gs.bars.publicApproval > 75 && gs.bars.economicState < 20, 
        tagline: 'Voice of the forgotten.', 
        narrative: 'You rode a wave of public anger into the highest office and never let go of the megaphone. By attacking the elites and rewarding your base, you changed the face of politics. You leave behind a fractured establishment and a loyal army of followers.', 
        profile: 'The Agitator' 
      },
      { 
        id: 'statesman', title: 'The Statesman', emoji: '🏛️', check: () => ['publicApproval', 'internationalTension', 'economicState', 'stateAuthority', 'partyLoyalty'].every(k => gs.bars[k] >= 40 && gs.bars[k] <= 70), 
        tagline: 'Dignity in every decree.', 
        narrative: 'You governed with a level of prestige and intellectual honesty rarely seen in the modern era. By putting the institution of the Presidency above your own ego, you restored faith in the government. You retire as the gold standard of leadership for future generations.', 
        profile: 'The Idealist' 
      },
      { 
        id: 'neutral', title: 'The Neutral', emoji: '🤝', check: () => true, 
        tagline: 'A quiet and stable departure.', 
        narrative: 'You did a decent job. Your term passed without major fanfare or scandal. While not a dramatic legacy, you navigated the nation through its challenges safely and handed off a stable administration.', 
        profile: 'The Administrator' 
      }
    ];

    // ═══════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════
    // MUSIC & SOUNDTRACK SYSTEM
    // ═══════════════════════════════════════════════════════════
    
root.TheOvalContent = { CARDS, ARCS, ENDINGS };
if (typeof module !== 'undefined' && module.exports) module.exports = root.TheOvalContent;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
