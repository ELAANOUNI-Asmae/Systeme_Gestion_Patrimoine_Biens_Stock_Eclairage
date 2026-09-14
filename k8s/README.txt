Apply:
  kubectl apply -f k8s/postgres.yaml
  kubectl apply -f k8s/backend.yaml

Check:
  kubectl get pods
  kubectl get services

Backend NodePort:
  http://localhost:30081
  (availability depends on your local Kubernetes environment)
