// Content for Fleet Council (team multiplayer mode).
// Every option is built so its weighted value (see optionValue in app/world-core.js)
// lands close to the other options on the same card: no option is a free win.
(function (root) {
  function o(text, effects, outcome) {
    return { text, effects, outcome };
  }

  const WORLD_TEMPLATES = [
    { id: 'aurora', name: 'Aurora Prime', hue: 188 },
    { id: 'nova', name: 'Nova Kepler', hue: 32 },
    { id: 'vega', name: 'Vega Drift', hue: 280 },
    { id: 'orion', name: 'Orion Forge', hue: 136 }
  ];

  // Stats are 0-100 and every world starts at 50 in each.
  const STATS = {
    morale: { label: 'Morale', short: 'MOR' },
    economy: { label: 'Economy', short: 'ECO' },
    energy: { label: 'Energy', short: 'NRG' },
    security: { label: 'Security', short: 'SEC' }
  };

  const RESOURCES = {
    gold: { label: 'Gold' },
    ore: { label: 'Ore' },
    ships: { label: 'Ships' }
  };

  // Rise-of-Kingdoms style base: the Command Core level caps every other building.
  const BUILDINGS = {
    core: {
      name: 'Command Core', maxLevel: 3, cost: { gold: 40, ore: 40 },
      describe: level => `Other buildings can reach level ${level}.`
    },
    mine: {
      name: 'Gold Mine', maxLevel: 3, cost: { gold: 20, ore: 15 }, produces: 'gold', rate: 8,
      describe: level => `Produces ${8 * level} gold per turn into storage.`
    },
    refinery: {
      name: 'Ore Refinery', maxLevel: 3, cost: { gold: 15, ore: 20 }, produces: 'ore', rate: 7,
      describe: level => `Produces ${7 * level} ore per turn into storage.`
    },
    reactor: {
      name: 'Reactor', maxLevel: 3, cost: { gold: 20, ore: 20 },
      describe: level => `+${3 * level} Energy per turn.`
    },
    shipyard: {
      name: 'Shipyard', maxLevel: 3, cost: { gold: 25, ore: 20 },
      describe: level => level ? `Build ships. Fleet cap ${3 + 3 * level}.` : 'Needed to build ships. Fleet cap 3.'
    },
    shield: {
      name: 'Shield Array', maxLevel: 3, cost: { gold: 20, ore: 25 },
      describe: level => `+${20 * level}% defence in battle.`
    },
    habitat: {
      name: 'Habitat Ring', maxLevel: 3, cost: { gold: 25, ore: 15 },
      describe: level => `+${2 * level} Morale per turn.`
    }
  };

  const SHIP_COST = { gold: 12, ore: 8 };

  // Personal cards found while harvesting. Each player may play one per turn.
  const SPECIAL_CARDS = {
    overclock: { name: 'Overclock', target: 'none', text: 'Your world produces +50% this turn.' },
    shield_matrix: { name: 'Shield Matrix', target: 'none', text: 'Your world defends at double strength this turn.' },
    sabotage: { name: 'Sabotage', target: 'world', text: 'A rival world loses half its uncollected storage and 4 Energy.' },
    convoy: { name: 'Trade Convoy', target: 'none', text: 'Your world gains 15 gold and 10 ore now.' },
    veto: { name: 'Veto', target: 'option', text: 'Strike one option from your world\'s current poll.' },
    rally: { name: 'Rally', target: 'none', text: 'Your world gains 6 Morale now.' },
    recruit: { name: 'Recruit Crew', target: 'none', text: 'Your world gains 1 ship now (fleet cap applies).' }
  };

  const SIGNALS = [
    'Requesting a trade 🤝',
    'Truce? 🕊️',
    'Nice move 👏',
    'You will regret that ⚔️',
    'Need help here 🆘',
    'GG 🚀'
  ];

  const SITUATIONS = [
    {
      id: 'derelict_freighter', art: 'ship', title: 'Derelict Freighter',
      body: 'A freighter drifts across your orbit. The hull is intact. The crew is silent.',
      options: [
        o('Strip it for parts.', { gold: 16, ore: 12, morale: -4 }, 'The scrap market loves you. The families of the missing crew do not.'),
        o('Tow it in and repair it.', { ships: 1, ore: -6, energy: -1 }, 'Your engineers bring an old hull back to life.'),
        o('Search for survivors first.', { morale: 6, gold: -10, energy: -1 }, 'Three survivors are found. The rescue becomes a story every child knows.')
      ]
    },
    {
      id: 'solar_flare', art: 'storm', title: 'Solar Flare Warning',
      body: 'Your star is about to throw a flare large enough to fry unshielded circuits.',
      options: [
        o('Raise every shield.', { security: 6, energy: -5, economy: 2 }, 'The flare passes. The grid is drained but nothing burns.'),
        o('Catch the flare in open collectors.', { energy: 9, security: -4, morale: -2 }, 'Batteries fill to the brim. Two sensor towers do not survive.'),
        o('Evacuate the outer rings.', { morale: 6, economy: -5, ore: 8 }, 'Everyone is safe, and evacuees clear old ore stockpiles on the way out.')
      ]
    },
    {
      id: 'miners_strike', art: 'crowd', title: 'Miners\' Strike',
      body: 'The deep-shaft miners lay down their drills and demand a share of the profits.',
      options: [
        o('Raise their wages.', { morale: 7, gold: -16 }, 'The drills spin again, and the miners sing your name.'),
        o('Automate the shafts.', { economy: 6, morale: -5, ore: 8 }, 'Machines never strike. People notice who was replaced.'),
        o('Order security to clear the picket.', { ore: 12, security: 2, economy: 3, morale: -5 }, 'Production resumes under armed watch.')
      ]
    },
    {
      id: 'pirate_toll', art: 'pirates', title: 'Pirate Toll Gate',
      body: 'Raiders have parked across your busiest trade lane and are charging a toll.',
      options: [
        o('Pay the toll.', { gold: -12, economy: 6 }, 'Trade flows. The pirates will remember who pays.'),
        o('Break the blockade.', { security: 6, ships: -1, morale: 2 }, 'One ship is lost, but the lane is yours again.'),
        o('Hire the pirates.', { ships: 1, gold: -6, morale: -1 }, 'Yesterday\'s raiders now fly your colours, for a price.')
      ]
    },
    {
      id: 'alien_signal', art: 'alien', title: 'Signal from the Dark',
      body: 'A repeating signal arrives from beyond the charted edge. It is not natural.',
      options: [
        o('Answer the signal.', { morale: 4, economy: 3, security: -4 }, 'Something answers back. Your people are thrilled and nervous.'),
        o('Jam the frequency.', { security: 5, morale: -2 }, 'Silence returns. Some citizens call it cowardice.'),
        o('Decode it quietly.', { energy: 5, gold: -8 }, 'The signal hides an efficient power design. Your labs adopt it.')
      ]
    },
    {
      id: 'reactor_overload', art: 'reactor', title: 'Reactor Overload',
      body: 'Demand has outgrown the core. Coolant alarms are ringing in the habitat decks.',
      options: [
        o('Cut power to homes.', { energy: 6, morale: -5, economy: 2 }, 'The factories hum. The homes go cold.'),
        o('Pay for an emergency repair.', { energy: 6, gold: -6, ore: -6 }, 'A costly fix, but the reactor is stable.'),
        o('Run it hot.', { energy: 10, security: -7 }, 'Output soars. So does the risk of a breach.'),
        o('Import power from a neighbour.', { energy: 4, morale: 2, gold: -12 }, 'The lights stay on, paid for in foreign credit.')
      ]
    },
    {
      id: 'trade_caravan', art: 'trade', title: 'Trade Caravan',
      body: 'A caravan of merchant haulers requests docking rights for the season.',
      options: [
        o('Buy their luxury goods.', { morale: 6, gold: -12 }, 'Exotic food and music fill the markets.'),
        o('Sell them surplus ore.', { gold: 16, ore: -12, economy: 2 }, 'Your ore heads off-world at a good price.'),
        o('Tax their passage heavily.', { gold: 16, economy: -2, security: 1 }, 'The treasury grows. Other caravans take note.')
      ]
    },
    {
      id: 'asteroid_rush', art: 'asteroid', title: 'Asteroid Rush',
      body: 'A metal-rich asteroid has drifted into reach. Everyone wants a piece.',
      options: [
        o('Claim it with drones.', { ore: 20, energy: -2 }, 'Drones swarm the rock and haul it home.'),
        o('Open it to settlers.', { morale: 4, economy: 3, security: -4 }, 'A wild frontier town springs up overnight.'),
        o('Fortify the claim.', { security: 4, ore: 8, gold: -12 }, 'Turrets guard the claim while miners dig.')
      ]
    },
    {
      id: 'refugee_fleet', art: 'ship', title: 'Refugee Fleet',
      body: 'Forty battered ships arrive, fleeing a war two systems away.',
      options: [
        o('Welcome them in.', { morale: 5, gold: -12, economy: 1 }, 'New hands, new stories, new mouths to feed.'),
        o('Recruit their pilots.', { ships: 1, morale: -2 }, 'Veteran pilots join your fleet. Their families wait outside.'),
        o('Turn them away.', { security: 4, gold: 4, morale: -2 }, 'Your borders stay closed. Your conscience is quieter.')
      ]
    },
    {
      id: 'spy_in_core', art: 'spy', title: 'Spy in the Core',
      body: 'Counter-intelligence has caught an agent copying fleet schedules.',
      options: [
        o('Hold a public trial.', { security: 5, morale: 2, economy: -4 }, 'Justice is seen to be done. Investors get nervous.'),
        o('Turn the spy into a double agent.', { security: 2, gold: 12, morale: -2 }, 'False schedules now flow back to their masters, for a fee.'),
        o('Quietly exile them.', { morale: 3, economy: 2, security: -2 }, 'No headlines, no drama, no lesson learned.')
      ]
    },
    {
      id: 'ion_storm', art: 'storm', title: 'Ion Storm Season',
      body: 'The ion storms have arrived early. Navigation is a gamble.',
      options: [
        o('Ground the fleet.', { security: -3, energy: 4, economy: 2 }, 'Engines rest and power is saved. Patrols stop.'),
        o('Fly through it for the profit.', { gold: 20, ships: -1, economy: 3 }, 'One ship never returns. The rest return rich.'),
        o('Build storm shelters.', { morale: 5, ore: -8 }, 'Families sleep safely through the howling.')
      ]
    },
    {
      id: 'academy_funding', art: 'academy', title: 'Academy Funding',
      body: 'The Star Academy can only expand one faculty this year.',
      options: [
        o('Fund the engineers.', { economy: 6, gold: -12 }, 'Smarter factories follow within months.'),
        o('Fund the pilots.', { security: 5, ore: -8 }, 'A new class of sharp pilots graduates.'),
        o('Fund the artists.', { morale: 6, gold: -12 }, 'Murals bloom along the corridors.')
      ]
    },
    {
      id: 'rival_ambassador', art: 'diplomat', title: 'The Ambassador',
      body: 'A rival ambassador arrives with a smile, a gift, and a proposal.',
      options: [
        o('Sign a trade pact.', { economy: 5, security: -2 }, 'Markets open both ways.'),
        o('Demand tribute.', { gold: 12, security: 2, morale: -2 }, 'They pay. They will not forget.'),
        o('Host a grand festival.', { morale: 5, gold: -8 }, 'Diplomacy through music and food.'),
        o('Offer a defence pact.', { security: 4, energy: -1 }, 'Two fleets now watch each other\'s backs.')
      ]
    },
    {
      id: 'black_market', art: 'market', title: 'The Black Market',
      body: 'A hidden market on Dock 7 sells everything from weapons to forbidden data.',
      options: [
        o('Shut it down.', { security: 5, economy: -2 }, 'Raids close the stalls. Some merchants leave for good.'),
        o('Tax it quietly.', { gold: 16, security: -1 }, 'The shadows now pay rent.'),
        o('Legalise it.', { economy: 5, morale: 1, security: -3 }, 'Business booms in the open. So do new risks.')
      ]
    },
    {
      id: 'ancient_wreck', art: 'artifact', title: 'Ancient Wreck',
      body: 'Divers find a hull older than any known civilisation, half-buried in ice.',
      options: [
        o('Study it.', { energy: 4, economy: 2, gold: -12 }, 'The wreck teaches your engineers a trick or two.'),
        o('Sell it to collectors.', { gold: 20, morale: -2 }, 'A fortune changes hands. Historians are furious.'),
        o('Enshrine it as a monument.', { morale: 5, economy: -2 }, 'Pilgrims come from every ring to see it.')
      ]
    },
    {
      id: 'deck_nine_plague', art: 'medical', title: 'Fever on Deck 9',
      body: 'A fast-moving fever is spreading through the lower decks.',
      options: [
        o('Quarantine the deck.', { security: 3, economy: -3, morale: 3 }, 'The fever is contained. Deck 9 goes quiet for a month.'),
        o('Rush a cure.', { morale: 5, gold: -8 }, 'The cure works. The bill is steep.'),
        o('Hide it and keep working.', { economy: 4, morale: -5, gold: 16 }, 'Output holds. Rumours spread faster than the fever.')
      ]
    },
    {
      id: 'shipwright_guild', art: 'shipyard', title: 'Shipwright Guild',
      body: 'The guild offers a deal on hulls, but only for this season.',
      options: [
        o('Commission a new cruiser.', { ships: 1, gold: -8 }, 'A fresh cruiser rolls off the slip.'),
        o('Upgrade old hulls.', { security: 4, ore: -8, morale: 1 }, 'The old fleet gets new armour.'),
        o('Sell your oldest hull.', { ships: -1, gold: 20, ore: 12 }, 'Scrap and coin fill the treasury.')
      ]
    },
    {
      id: 'ice_shortage', art: 'ice', title: 'Water Ice Shortage',
      body: 'Your ice reserves are falling. The water ration board needs a decision.',
      options: [
        o('Ration water and sell the rest.', { morale: -3, economy: 2, gold: 16 }, 'Taps run slow. Coffers fill.'),
        o('Mine the passing comet.', { ore: 12, energy: -4, morale: 4 }, 'A daring mission brings back ice and metal.'),
        o('Buy ice from traders.', { morale: 4, gold: -4 }, 'Problem solved, for now.')
      ]
    },
    {
      id: 'rebel_moon', art: 'rebels', title: 'Rebel Moon',
      body: 'Your mining moon declares that it no longer answers to the Council.',
      options: [
        o('Grant it autonomy.', { morale: 5, security: -2 }, 'The moon celebrates. Others wonder if they can ask too.'),
        o('Occupy the moon.', { security: 5, ore: 8, morale: -4 }, 'Order is restored by force. Ore flows again.'),
        o('Bribe the rebel leaders.', { security: 4, morale: 1, gold: -8 }, 'The leaders become very loyal, very fast.')
      ]
    },
    {
      id: 'grid_contract', art: 'reactor', title: 'Energy Contract',
      body: 'A neighbouring world wants to buy power from your grid.',
      options: [
        o('Sell them power.', { gold: 16, energy: -4, economy: 3 }, 'Power flows out, coin flows in.'),
        o('Store it for a hard winter.', { energy: 5, economy: -2 }, 'Your batteries are full. The deal goes elsewhere.'),
        o('Power your own factories.', { economy: 5, energy: -2 }, 'Your factories run a double shift.')
      ]
    },
    {
      id: 'fleet_exercise', art: 'fleet', title: 'Fleet Exercise',
      body: 'Admirals ask how to use the fleet during this quiet season.',
      options: [
        o('Run full war games.', { security: 6, energy: -3 }, 'Gunners are sharper. Fuel tanks are lighter.'),
        o('Escort trade convoys.', { gold: 12, security: 2, energy: -2 }, 'Merchants pay well for safe passage.'),
        o('Stand the crews down.', { morale: 4, energy: 2, security: -3 }, 'Crews go home to their families for a while.'),
        o('Patrol the trade lanes.', { gold: 8, security: 2, morale: -1 }, 'Long patrols, small bounties.')
      ]
    },
    {
      id: 'comet_festival', art: 'festival', title: 'Comet Festival',
      body: 'The once-a-generation comet is passing. People want to celebrate.',
      options: [
        o('Throw a grand celebration.', { morale: 7, gold: -12, energy: -1 }, 'Fireworks light up three rings.'),
        o('Hold a modest gathering.', { morale: 4, economy: -1 }, 'A quiet night under the comet.'),
        o('Keep everyone working.', { economy: 5, morale: -2 }, 'The comet passes over busy factories.')
      ]
    },
    {
      id: 'mercenary_offer', art: 'fleet', title: 'Mercenary Offer',
      body: 'A mercenary captain offers two gunships, paid up front.',
      options: [
        o('Hire both gunships.', { ships: 2, gold: -24, morale: -1 }, 'Two gunships join your fleet.'),
        o('Train local crews instead.', { security: 4, morale: 1, ore: -8 }, 'Slower, but your own people fly the guns.'),
        o('Decline politely.', { economy: 4, security: -1 }, 'The money stays home and works.')
      ]
    },
    {
      id: 'gravity_survey', art: 'planet', title: 'Gravity Well Survey',
      body: 'Surveyors have mapped a stable orbit around a dense, uncharted world.',
      options: [
        o('Build a mining rig there.', { ore: 20, gold: -8 }, 'The rig starts hauling dense metals.'),
        o('Build a navigation beacon.', { security: 3, economy: 2, energy: -2 }, 'Safer lanes for everyone.'),
        o('Leave a research probe.', { energy: 4, ore: -4 }, 'The probe sends back efficient orbit data.')
      ]
    }
  ];

  const content = {
    WORLD_TEMPLATES, STATS, RESOURCES, BUILDINGS, SHIP_COST, SPECIAL_CARDS, SIGNALS, SITUATIONS
  };

  root.FleetCouncilContent = content;
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
