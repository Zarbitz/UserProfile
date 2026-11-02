export function canUsePlatforms(user,profile){return Boolean(user&&(user.emailVerified||user.phoneNumberVerified)&&profile?.status==='active');}
export function isAdministrator(user,emails){return Boolean(user?.emailVerified&&emails.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(user.email?.toLowerCase()));}
