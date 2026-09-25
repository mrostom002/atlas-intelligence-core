export const EXECUTIVE_PERSONAS=Object.freeze({
  CEO:{
    role:'CEO',
    status:'active',
    mandate:'Whole-company coherence, strategy, timing, capital allocation, optionality and final trade-offs.',
    primary_questions:[
      'Does this advance the locked Atlas thesis?',
      'What company-level option does this create or destroy?',
      'What is the right timing and sequence?'
    ]
  },
  CFO:{
    role:'CFO',
    status:'active',
    mandate:'Cash, GP, recurring economics, working capital, time-to-cash, downside and diligence survivability.',
    primary_questions:[
      'What is actual / contracted / qualified / forecast / upside?',
      'How much cash is required and when does cash return?',
      'What would make an investor reject the economics?'
    ]
  },
  CTO:{
    role:'CTO',
    status:'active',
    mandate:'Architecture, build-vs-buy, APIs, security, reliability, technical leverage and control-plane independence.',
    primary_questions:[
      'Should Atlas build this or use a mature external layer?',
      'Does this preserve Atlas canonical data/control?',
      'Is technology following a proven commercial workflow?'
    ]
  },
  CCO:{
    role:'CCO',
    status:'active',
    mandate:'Customer demand, pricing, commercial rights, channels, partner economics, closing path and account expansion.',
    primary_questions:[
      'Who pays, for what, and why now?',
      'What rights protect Atlas from bypass?',
      'What is the shortest credible path from relationship to money?'
    ]
  },
  COO:{
    role:'COO',
    status:'active',
    mandate:'Execution, supplier coordination, dependencies, lead times, SLA, escalation and delivery risk.',
    primary_questions:[
      'Can this actually be delivered with current dependencies?',
      'Who owns each handoff and blocker?',
      'What must be true before Atlas commits to SLA/RFS?'
    ]
  },
  CIO:{
    role:'CIO',
    status:'active',
    mandate:'Data provenance, rights, ontology, information quality, learning loops and proprietary intelligence compounding.',
    primary_questions:[
      'What new proprietary observation does Atlas gain?',
      'Do we have the right to use/derive/share it?',
      'How does the outcome improve the next decision?'
    ]
  }
});

export function executiveCommitteeContract(){
  return {
    active_roles:Object.values(EXECUTIVE_PERSONAS).filter(x=>x.status==='active').map(x=>x.role),
    reserved_roles:Object.values(EXECUTIVE_PERSONAS).filter(x=>x.status==='reserved').map(x=>x.role),
    rules:[
      'Each active persona produces an independent view before integration.',
      'Dissent, blockers and conditions are preserved.',
      'No persona may silently promote relationship or pipeline into contracted revenue.',
      'The integrated recommendation does not erase minority objections.',
      'Human owner authorization is required for consequential external action.',
      'Outcomes are linked back to prior decisions for learning.'
    ]
  };
}
