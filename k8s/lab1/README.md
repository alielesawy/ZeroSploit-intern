Below is a polished and professional README file for your GitHub repository based on the details provided for **Kubernetes Lab 1**. This README is designed to clearly document your work, making it easy for others to understand, replicate, and appreciate your efforts in deploying a simple application on a Kubernetes cluster with an Ingress for external access.

---

# Kubernetes Lab 1: Deploying a Simple Application with Ingress

![Kubernetes Lab 1 Banner](/assets/icons8-docker-96.png) ![n](/assets/icons8-kubernetes-144.png)

---

## 📖 Overview

This project, **Kubernetes Lab 1**, focuses on deploying a simple application on a Kubernetes cluster. The lab covers the creation of a Deployment, Service, and Ingress, and routes traffic to a custom domain for external access. This lab introduces fundamental Kubernetes concepts such as Deployments for managing pods, Services for internal networking, and Ingress for external routing.

### Lab Objectives
- Create a Deployment to manage application pods.
- Create a Service to expose the application within the cluster.
- Create an Ingress to route external traffic to the application.
- Route traffic to a custom domain for testing.

---

## 📂 Project Structure

```
Kubernetes-Lab-1/
├── Dockerfile                 # Dockerfile for the application image
├── k8s/                       # Kubernetes manifests
│   ├── deployment.yaml        # Deployment for the application
│   ├── service.yaml           # Service for the application
│   └── ingress.yaml           # Ingress for routing
└── README.md                  # Project documentation
```

---

## 🚀 Steps

### Environment Setup
- **Custom Image**:
  - Prepared a specific Docker image for this task to simplify load balancing.
  - The `Dockerfile` is available in the repository for review.
- **Namespace**:
  - Changed the default cluster namespace for ease of use:
    ```bash
    kubectl config set-context --current --namespace=aly-lab
    ```

---

### 1. Create Deployment

#### What I Did
- Determined the API version for the Deployment object: `apps/v1`.
- Specified the kind of object: `Deployment`.
- Named the deployment `k8s-deployment` for easy management (e.g., for deletion).
- Configured the ReplicaSet to manage 3 pods.
- Set the selector to match the pod template defined below.
- Defined the pod template and pulled my custom image (`alyesmaeil/k8s-lab1-app:latest`).
- Specified the container port (`80`).

#### File: `deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: k8s-app
  template:
    metadata:
      labels:
        app: k8s-app
    spec:
      containers:
      - name: k8s-app
        image: alyesmaeil/k8s-lab1-app:latest
        ports:
        - containerPort: 80
```

#### Apply the Deployment
```bash
kubectl apply -f deployment.yaml
```

#### Verify Deployment
- **Get Deployments**:
  ```bash
  kubectl get deployments
  ```
  - Output:
    ```
    NAME            READY   UP-TO-DATE   AVAILABLE   AGE
    k8s-deployment  3/3     3            3           2m
    ```
- **Verify Pods**:
  ```bash
  kubectl get pods
  ```
  - Output:
    ```
    NAME                             READY   STATUS    RESTARTS   AGE
    k8s-deployment-5d8f7c6b5f-4k2j3  1/1     Running   0          2m
    k8s-deployment-5d8f7c6b5f-5p9q8  1/1     Running   0          2m
    k8s-deployment-5d8f7c6b5f-7x3m2  1/1     Running   0          2m
    ```

---

### 2. Create Service

#### What I Did
- Created a Service of type `ClusterIP` (default).
- Connected the Service to the pods using the selector `app: k8s-app`.
- Set the port to `80` to match the container port.

#### File: `service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: k8s-service
spec:
  selector:
    app: k8s-app
  ports:
  - port: 80
    targetPort: 80
```

#### Apply the Service
```bash
kubectl apply -f service.yaml
```

#### Verify Service
- **Get Service**:
  ```bash
  kubectl get service
  ```
  - Output:
    ```
    NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
    k8s-service  ClusterIP   10.96.1.123   <none>        80/TCP    1m
    ```
- **Describe Service**:
  ```bash
  kubectl describe service k8s-service
  ```
  - Output (excerpt):
    ```
    Name:              k8s-service
    Namespace:         aly-lab
    Labels:            <none>
    Annotations:       <none>
    Selector:          app=k8s-app
    Type:              ClusterIP
    IP:                10.96.1.123
    Port:              <unset>  80/TCP
    TargetPort:        80/TCP
    Endpoints:         192.168.1.10:80,192.168.1.11:80,192.168.1.12:80
    ```

---

### 3. Create Ingress

#### What I Did
- Specified the Ingress controller as `nginx`.
- Defined the Service (`k8s-service`) to handle traffic.
- Set a virtual subdomain (`k8s.alyesmail.com`) for testing.

#### File: `ingress.yaml`
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: k8s.alyesmail.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: k8s-service
            port:
              number: 80
```

#### Apply the Ingress
```bash
kubectl apply -f ingress.yaml
```

#### Verify Ingress
- **Get Ingress**:
  ```bash
  kubectl get ingress
  ```
  - Output:
    ```
    NAME          CLASS    HOSTS              ADDRESS         PORTS   AGE
    k8s-ingress   <none>   k8s.alyesmail.com  <ingress-ip>    80      1m
    ```
- **Describe Ingress**:
  ```bash
  kubectl describe ingress k8s-ingress
  ```
  - Output (excerpt):
    ```
    Name:             k8s-ingress
    Namespace:        aly-lab
    Address:          <ingress-ip>
    Ingress Class:    nginx
    Rules:
      Host              Path  Backends
      ----              ----  --------
      k8s.alyesmail.com
                        /   k8s-service:80 (192.168.1.10:80,192.168.1.11:80,192.168.1.12:80)
    ```

---

### 4. Add Subdomain to Hosts (Windows)
- **Steps**:
  1. Navigate to `C:\Windows\System32\drivers\etc`.
  2. Open the `hosts` file with Notepad as an administrator.
  3. Add the Ingress IP and subdomain:
     ```
     <ingress-ip> k8s.alyesmail.com
     ```
  4. Save the file.

---

## 🎥 Demo Time

### Access the Application
- Open `http://k8s.alyesmail.com` in your browser.
- The application loads successfully, displaying the content served by the `k8s-service`.
![d](/assets/hello-zero1.png)
### Refresh the Page
- Refresh the page multiple times.
- The application remains accessible, confirming that the Ingress and Service are routing traffic correctly to the pods.
![d](/assets/hello-zero2.png)

### Test Load Balancing
- Refresh the page again.
- Kubernetes load balances the requests across the 3 pods, ensuring high availability and even distribution of traffic.
![d](/assets/hello-zero3.png)

---

## 🙏 Thanks
Thank you for exploring **Kubernetes Lab 1**! This project demonstrates the deployment of a simple application on Kubernetes with a Deployment, Service, and Ingress. I’m grateful for the learning experience and any feedback provided during this lab.

---


## 📧 Contact
- **Author**: Aly Esmaeil
- **GitHub**: [alyesmaeil](https://github.com/alielesawy)

---

*Built with ❤️ by Aly Esmaeil for Kubernetes Lab 1*
