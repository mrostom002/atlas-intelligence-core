const score={collected:4,delivered:3,won:3,progressed:2,stalled:0,no_response:-1,lost:-2,invalidated:-3};

export function summarizeLearning(records=[]){
  const byCase=new Map();
  for(const r of records){
    if(!r?.case_id) continue;
    const x=byCase.get(r.case_id)||{case_id:r.case_id,events:0,score:0,positive:0,negative:0,last_outcome:null};
    x.events+=1;
    x.score+=score[r.outcome_type]??0;
    if(['collected','delivered','won','progressed'].includes(r.outcome_type))x.positive+=1;
    if(['lost','invalidated','no_response'].includes(r.outcome_type))x.negative+=1;
    x.last_outcome=r.outcome_type;
    byCase.set(r.case_id,x);
  }
  return [...byCase.values()].map(x=>({
    ...x,
    learning_state:x.events<2?'insufficient_history':x.score>2?'positive_pattern':x.score<0?'negative_pattern':'mixed_pattern',
    recommendation:'human review required before changing evidence, forecast, supplier ranking or commercial state'
  }));
}
