import { createHash } from 'node:crypto';

export const PUBLIC_INTELLIGENCE_TOPICS=Object.freeze([
  'regulation','tender','carrier_product','route','pop','landing_station','ix',
  'datacenter','power','cloud_ai','supplier_pricing','api_standard','hiring',
  'outage_resilience','investment','customer_expansion','geography'
]);

export function normalizeUrl(url){
  const u=new URL(url);
  u.hash='';
  for(const k of [...u.searchParams.keys()]){
    if(/^utm_|^(fbclid|gclid)$/i.test(k))u.searchParams.delete(k);
  }
  u.hostname=u.hostname.toLowerCase();
  return u.toString();
}

export function contentHash({url,title='',text=''}={}){
  return createHash('sha256').update(normalizeUrl(url)+'\n'+title.trim()+'\n'+text.trim()).digest('hex');
}

export function validatePublicItem(item={}){
  if(!item.url)throw new Error('Public item URL is required.');
  const u=new URL(item.url);
  if(!['http:','https:'].includes(u.protocol))throw new Error('Only public http(s) sources are allowed.');
  if(item.data_class && item.data_class!=='public')throw new Error('Collector v0 accepts PUBLIC data only.');
  return {
    canonical_url:normalizeUrl(item.url),
    title:String(item.title||'').trim()||null,
    published_at:item.published_at||null,
    source_snapshot:String(item.source_snapshot||'').trim()||null,
    content_hash:contentHash({url:item.url,title:item.title||'',text:item.source_snapshot||''}),
    public_data:true,
    raw_storage_policy:item.raw_storage_policy||'minimal',
    metadata:item.metadata||{}
  };
}

export function observationCandidate({
  item_id,observation_type,subject_name=null,predicate,object_value=null,event_date=null,
  countries=[],account_names=[],corridor_names=[],topics=[],relevance_score=0,
  source_authority_tier=3,evidence_tier=2,extraction_mode='ai',provider=null,model=null,
  inference_text=null,why_atlas=null
}={}){
  if(!item_id||!predicate)throw new Error('item_id and predicate are required.');
  return {
    item_id,observation_type:String(observation_type||'public_signal'),
    subject_name,predicate,object_value,event_date,countries,account_names,corridor_names,
    topics:topics.filter(t=>PUBLIC_INTELLIGENCE_TOPICS.includes(t)),
    relevance_score:Math.max(0,Math.min(100,Number(relevance_score)||0)),
    source_authority_tier,
    evidence_tier,
    extraction_mode,
    provider,model,inference_text,why_atlas,
    promotion_status:'candidate'
  };
}

export function shouldPromote(obs={}){
  return {
    eligible:Number(obs.relevance_score)>=60 && Number(obs.source_authority_tier)<=3,
    reason:Number(obs.relevance_score)<60
      ? 'relevance_below_threshold'
      : Number(obs.source_authority_tier)>3
        ? 'source_authority_too_weak'
        : 'eligible_for_human_review',
    automatic:false
  };
}
