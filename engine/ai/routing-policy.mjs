export const DATA_CLASS=Object.freeze({
  PUBLIC:'public',
  INTERNAL_SANITIZED:'internal_sanitized',
  CONFIDENTIAL_COMMERCIAL:'confidential_commercial',
  PRIVATE_RELATIONSHIP:'private_relationship',
  RESTRICTED_SECRET:'restricted_secret'
});

export const PROVIDER=Object.freeze({
  CLOUDFLARE:'cloudflare-workers-ai',
  GEMINI_FREE:'gemini-developer-free',
  GOOGLE_CLOUD:'google-cloud-managed-ai',
  CHATGPT_ASSISTED:'chatgpt-assisted',
  CLAUDE_ASSISTED:'claude-assisted'
});

export function allowedProviders(dataClass,{googleCloudVerified=false,humanApproved=false,rightsPermitAI=false}={}){
  switch(dataClass){
    case DATA_CLASS.PUBLIC:
      return [PROVIDER.GEMINI_FREE,PROVIDER.CLOUDFLARE,PROVIDER.CHATGPT_ASSISTED,PROVIDER.CLAUDE_ASSISTED];
    case DATA_CLASS.INTERNAL_SANITIZED:
      return [
        PROVIDER.CLOUDFLARE,
        PROVIDER.CHATGPT_ASSISTED,
        PROVIDER.CLAUDE_ASSISTED,
        ...(googleCloudVerified?[PROVIDER.GOOGLE_CLOUD]:[])
      ];
    case DATA_CLASS.CONFIDENTIAL_COMMERCIAL:
      if(!rightsPermitAI)return [];
      return [
        PROVIDER.CLOUDFLARE,
        ...(googleCloudVerified?[PROVIDER.GOOGLE_CLOUD]:[]),
        ...(humanApproved?[PROVIDER.CHATGPT_ASSISTED,PROVIDER.CLAUDE_ASSISTED]:[])
      ];
    case DATA_CLASS.PRIVATE_RELATIONSHIP:
      return humanApproved && rightsPermitAI ? [PROVIDER.CLOUDFLARE] : [];
    case DATA_CLASS.RESTRICTED_SECRET:
      return [];
    default:
      return [];
  }
}

export function preferredProvider(dataClass,options={}){
  return allowedProviders(dataClass,options)[0] ?? null;
}

export function shouldFanOut({dataClass,importance='normal',task='reasoning'}={}){
  return dataClass===DATA_CLASS.PUBLIC && ['high','critical'].includes(importance) &&
    ['osint','research','reasoning','verification'].includes(task);
}

export function aiOutputEvidenceClass(){
  return {
    evidence:false,
    default_label:'INFERENCE',
    upgrade_rule:'Only underlying verified sources/events can upgrade the claim.'
  };
}
