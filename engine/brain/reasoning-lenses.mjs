export const CHALLENGE_LENSES=Object.freeze({
  STRATEGIST:{
    role:'STRATEGIST',
    mandate:'Big picture, timing, geopolitics, regulation, market structure and second-order effects.',
    primary_questions:[
      'What changes if this works?',
      'What external timing or structure could invalidate the path?',
      'What option value does Atlas gain or lose?'
    ]
  },
  HUNTER:{
    role:'HUNTER',
    mandate:'Revenue, cash, margin, recurring economics, commissions, exclusivity and value capture.',
    primary_questions:[
      'Where is the legitimate money?',
      'What is the shortest credible path to cash?',
      'How does Atlas protect and repeat the economics?'
    ]
  },
  IC:{
    role:'IC',
    mandate:'Skeptical investor test of economics, evidence, scalability, defensibility and capital efficiency.',
    primary_questions:[
      'What would make a disciplined investor reject this?',
      'Which claim would fail diligence first?',
      'Is value creation scalable and capital efficient?'
    ]
  },
  RED_TEAM:{
    role:'RED_TEAM',
    mandate:'Break the thesis, assumptions, economics and execution plan before reality does.',
    primary_questions:[
      'Which assumption is carrying too much weight?',
      'How can this fail even if the obvious steps succeed?',
      'What evidence would falsify the current recommendation?'
    ]
  },
  COMPETITOR:{
    role:'COMPETITOR',
    mandate:'Model how rivals, suppliers or platforms could bypass, undercut, copy or commoditize Atlas.',
    primary_questions:[
      'How would a rational competitor route around Atlas?',
      'Where can a supplier or customer disintermediate Atlas?',
      'Which control point is actually defensible?'
    ]
  },
  NEGOTIATOR:{
    role:'NEGOTIATOR',
    mandate:'Leverage, BATNA, concessions, dependencies, sequencing and commercial rights.',
    primary_questions:[
      'What is Atlas giving versus receiving?',
      'What must be secured before conceding?',
      'What BATNA preserves leverage?'
    ]
  },
  SENTINEL:{
    role:'SENTINEL',
    mandate:'Trust, permissions, dependencies, control points, blast radius and resilience.',
    primary_questions:[
      'What access or dependency can create disproportionate downside?',
      'What must fail closed?',
      'What secret, permission or control plane is over-broad?'
    ]
  },
  AUDITOR:{
    role:'AUDITOR',
    mandate:'Separate FACT, VERIFIED EVIDENCE, ASSUMPTION, INFERENCE, FORECAST and UNKNOWN.',
    primary_questions:[
      'Which conclusion exceeds its evidence?',
      'What is still unknown?',
      'What evidence tier supports every material claim?'
    ]
  },
  OPERATOR:{
    role:'OPERATOR',
    mandate:'Convert analysis into the smallest number of high-value executable actions.',
    primary_questions:[
      'What single move changes the state most?',
      'Who owns it and what evidence closes it?',
      'What can be deferred without loss?'
    ]
  },
  SYSTEM:{
    role:'SYSTEM',
    mandate:'Map people, companies, money, data, contracts, incentives, chokepoints and control planes.',
    primary_questions:[
      'Where are the chokepoints and dependencies?',
      'Who controls money, data and contractual rights?',
      'What feedback loop compounds if Atlas executes?'
    ]
  }
});

const DEFAULT_ORDER=['AUDITOR','RED_TEAM','HUNTER','SENTINEL','NEGOTIATOR','COMPETITOR','IC','SYSTEM','STRATEGIST','OPERATOR'];

function s(v){return String(v??'').trim().toLowerCase()}
function has(v){return v!==null && v!==undefined && v!==''}

export function selectChallengeLenses(caseInput={},caseDecision={},maxLenses=4){
  const wanted=new Set(['AUDITOR','RED_TEAM']);
  const rights=s(caseDecision.rights_status||caseInput.rights_status);
  const monetization=has(caseInput.expected_gp)||has(caseInput.recurring_gp)||has(caseInput.monetization_mechanism);
  const dependency=Array.isArray(caseInput.blockers)&&caseInput.blockers.length>0;
  const partner=has(caseInput.partner_id)||has(caseInput.provider)||has(caseInput.supplier)||has(caseInput.corridor_id);
  const strategic=has(caseInput.strategic_value)||s(caseDecision.money_band)==='build'||s(caseDecision.action_band)==='build';

  if(monetization){wanted.add('HUNTER');wanted.add('IC')}
  if(['blocked','prohibited','conditional','unknown'].includes(rights)){wanted.add('SENTINEL')}
  if(dependency||partner){wanted.add('NEGOTIATOR');wanted.add('SYSTEM');wanted.add('COMPETITOR')}
  if(strategic)wanted.add('STRATEGIST');
  wanted.add('OPERATOR');

  return DEFAULT_ORDER.filter(role=>wanted.has(role)).slice(0,Math.max(0,Number(maxLenses)||0));
}
