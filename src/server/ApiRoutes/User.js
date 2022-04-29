import appConfig from '../../app/data/appConfig';
import nyplApiClient from '../../server/routes/nyplApiClient';

function requireUser(req, res) {
  if (!req.patronTokenResponse || !req.patronTokenResponse.isTokenValid ||
    !req.patronTokenResponse.decodedPatron || !req.patronTokenResponse.decodedPatron.sub) {
    // redirect to login
    const fullUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    if (!fullUrl.includes('%2Fapi%2F')) {
      res.redirect(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
    }
    return { redirect: true };
  }
  return { redirect: false };
}

function eligibility(req, res) {
  if (!req.patronTokenResponse || !req.patronTokenResponse.decodedPatron
     || !req.patronTokenResponse.decodedPatron.sub) {
    res.send(JSON.stringify({ eligibility: true }));
    return;
  }
  const id = req.patronTokenResponse.decodedPatron.sub;
  nyplApiClient().then(client => client.get(`/patrons/${id}/hold-request-eligibility`, { cache: false }))
    .then((response) => { res.send(JSON.stringify(response)); });
}

export default { eligibility, requireUser };
