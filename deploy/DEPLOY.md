# Guia de Deploy - Rango Restaurante Frontend

Este documento descreve como realizar o deploy da aplicação em um cluster Kubernetes.

## 1. Build da Imagem Docker

```bash
docker build -t seu-usuario/app-pedidos-front:latest .
docker push seu-usuario/app-pedidos-front:latest
```

## 2. Configuração do Kubernetes

### Criar Secrets (Confidencial)
Antes de aplicar os manifests, crie as secrets para os dados sensíveis:

```bash
kubectl create secret generic rango-secrets \
  --from-literal=nextauth-secret='SUA_SECRET_AQUI' \
  --from-literal=google-client-id='SEU_ID_GOOGLE' \
  --from-literal=google-client-secret='SUA_SECRET_GOOGLE'
```

### Aplicar ConfigMap e Deployment
Ajuste os valores no arquivo `deploy/rango-front-configmap.example.yaml` e então execute:

```bash
kubectl apply -f deploy/rango-front-configmap.example.yaml
kubectl apply -f deploy/rango-front.yaml
```

## 3. Ingress (Opcional)
Se estiver usando um Ingress Controller (como NGINX), adicione uma regra para apontar para o serviço `app-pedidos-front-service` na porta 80.
