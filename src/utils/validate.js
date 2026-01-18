function requireFields(obj, fields){
  const missing = [];
  for(const f of fields){
    if(obj[f] === undefined || obj[f] === null) missing.push(f);
  }
  return missing;
}
module.exports = { requireFields };
