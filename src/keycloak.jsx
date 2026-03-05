
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180/',
  realm: 'pressing-realm',
  clientId: 'pressing-frontend',
});

export default keycloak;