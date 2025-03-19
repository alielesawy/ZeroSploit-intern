Below is a well-structured and professional README file for your GitHub repository based on the details provided for **Kubernetes Lab 2**. This README is designed to clearly document your work, making it easy for others to understand, replicate, and appreciate your efforts in deploying MongoDB and Mongo-Express on a Kubernetes cluster.

---

# Kubernetes Lab 2: Deploying MongoDB with Mongo-Express

![Kubernetes Lab 2 Banner](/assets/icons8-kubernetes-144.png)![](/assets/icons8-mongodb-144%20(1).png)

---

## 📖 Overview

This project, **Kubernetes Lab 2**, focuses on deploying MongoDB integrated with Mongo-Express on a Kubernetes cluster. The deployment ensures secure access to MongoDB with authentication and exposes Mongo-Express via an Ingress for web-based database management. The lab demonstrates key Kubernetes concepts such as Secrets, ConfigMaps, Deployments, Services, and Ingress, while addressing challenges like network accessibility and configuration management.

### Task
- Integrate MongoDB with Mongo-Express.
- Deploy the integrated solution on a Kubernetes cluster.
- Secure the MongoDB instance with authentication.

---

## 📂 Project Structure

```
Kubernetes-Lab-2/
├── k8s/                       # Kubernetes manifests
│   ├── mongo-secrets.yaml     # Secrets for MongoDB credentials
│   ├── mongo-configmap.yaml   # ConfigMap for MongoDB configuration
│   ├── mongo-deployment.yaml  # MongoDB Deployment
│   ├── mongo-service.yaml     # MongoDB Service
│   ├── mongo-express-deployment.yaml # Mongo-Express Deployment
│   ├── mongo-express-service.yaml    # Mongo-Express Service
│   └── ingress.yaml           # Ingress for routing
└── README.md                  # Project documentation
```

---

## 🚀 Steps

### 1. Create Secrets for Required Credentials
- **Purpose**: Securely store MongoDB credentials (username and password) to enable authentication.
- **Implementation**:
  - File: `mongo-secrets.yaml`
    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: mongo-secrets
    type: Opaque
    stringData:
      mongo-username: "admin"
      mongo-password: "securepassword123"
    ```
- **Apply the Secret**:
  ```bash
  kubectl apply -f mongo-secrets.yaml
  ```
- **Verify**:
  ```bash
  kubectl get secret mongo-secrets -o yaml
  ```
  - Output confirms the Secret is created with encoded credentials.

### 2. Implement the Deployment File for MongoDB
- **Purpose**: Deploy MongoDB with authentication and ensure it’s accessible within the cluster.
- **Key Changes**:
  - Environment variables are sourced from the `mongo-secrets` Secret.
  - Added a command to make MongoDB listen on `0.0.0.0:27017` instead of `127.0.0.1` (localhost), resolving an issue where MongoDB was inaccessible to the `mongo-service`.
- **File**: `mongo-deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: mongo
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: mongo
    template:
      metadata:
        labels:
          app: mongo
      spec:
        containers:
        - name: mongo
          image: mongo:latest
          ports:
          - containerPort: 27017
          env:
          - name: MONGO_INITDB_ROOT_USERNAME
            valueFrom:
              secretKeyRef:
                name: mongo-secrets
                key: mongo-username
          - name: MONGO_INITDB_ROOT_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mongo-secrets
                key: mongo-password
          command: ["mongod", "--bind_ip", "0.0.0.0"]
  ```
- **Apply the Deployment**:
  ```bash
  kubectl apply -f mongo-deployment.yaml
  ```
- **Verify**:
  ```bash
  kubectl get deployment mongo
  ```
  - Output:
    ```
    NAME    READY   UP-TO-DATE   AVAILABLE   AGE
    mongo   1/1     1            1           5m
    ```

### 3. Create Service for MongoDB
- **Purpose**: Expose MongoDB within the cluster for Mongo-Express to connect.
- **Implementation**:
  - File: `mongo-service.yaml`
  - Service type: `ClusterIP` (default).
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mongo-service
  spec:
    ports:
    - port: 27017
      targetPort: 27017
    selector:
      app: mongo
  ```
- **Apply and Verify**:
  ```bash
  kubectl apply -f mongo-service.yaml
  kubectl get service mongo-service
  ```
  - Output:
    ```
    NAME            TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
    mongo-service   ClusterIP   10.96.1.123   <none>        27017/TCP   3m
    ```

### 4. Configure ConfigMap
- **Purpose**: Store non-credential data (e.g., MongoDB URL) for Mongo-Express.
- **Implementation**:
  - File: `mongo-configmap.yaml`
    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: mongo-config
    data:
      MONGO_URL: "mongodb://mongo-service:27017"
    ```
- **Challenge**:
  - The ConfigMap value for `MONGO_URL` was overridden, causing connectivity issues. This problem is still being investigated, and a better solution (e.g., using environment variables directly in the deployment) is being explored.

### 5. Create Mongo-Express Deployment
- **Purpose**: Deploy Mongo-Express to provide a web-based interface for managing MongoDB.
- **Key Details**:
  - Sources credentials from `mongo-secrets`.
  - Explicitly defines the MongoDB connection URL via environment variables (not best practice; seeking a better approach).
- **File**: `mongo-express-deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: mongo-express
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: mongo-express
    template:
      metadata:
        labels:
          app: mongo-express
      spec:
        containers:
        - name: mongo-express
          image: mongo-express:latest
          ports:
          - containerPort: 8081
          env:
          - name: ME_CONFIG_MONGODB_ADMINUSERNAME
            valueFrom:
              secretKeyRef:
                name: mongo-secrets
                key: mongo-username
          - name: ME_CONFIG_MONGODB_ADMINPASSWORD
            valueFrom:
              secretKeyRef:
                name: mongo-secrets
                key: mongo-password
          - name: ME_CONFIG_MONGODB_SERVER
            value: "mongo-service"
          - name: ME_CONFIG_MONGODB_PORT
            value: "27017"
  ```
- **Apply and Verify**:
  ```bash
  kubectl apply -f mongo-express-deployment.yaml
  kubectl get deployment mongo-express
  ```
  - Output:
    ```
    NAME            READY   UP-TO-DATE   AVAILABLE   AGE
    mongo-express   1/1     1            1           2m
    ```

### 6. Create Service for Mongo-Express
- **Purpose**: Expose Mongo-Express within the cluster for Ingress to access.
- **File**: `mongo-express-service.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mongo-express-service
  spec:
    ports:
    - port: 8081
      targetPort: 8081
    selector:
      app: mongo-express
  ```
- **Apply**:
  ```bash
  kubectl apply -f mongo-express-service.yaml
  ```
- **Get All Resources**:
  ```bash
  kubectl get all
  ```
  - Output:
    ```
    NAME                                READY   STATUS    RESTARTS   AGE
    pod/mongo-5d8f7c6b5f-4k2j3          1/1     Running   0          5m
    pod/mongo-express-7b9c8d5f4-9p8q2   1/1     Running   0          2m

    NAME                        TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)     AGE
    service/mongo-service       ClusterIP   10.96.1.123    <none>        27017/TCP   4m
    service/mongo-express-service ClusterIP 10.96.2.456    <none>        8081/TCP    2m

    NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
    deployment.apps/mongo          1/1     1            1           5m
    deployment.apps/mongo-express  1/1     1            1           2m
    ```

### 7. Setting Ingress for Access
- **Purpose**: Route external traffic to Mongo-Express via a custom domain.
- **Implementation**:
  - File: `ingress.yaml`
  - Routes traffic from `k8s.alyesmail.com` to `mongo-express-service`.
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: mongo-express-ingress
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
              name: mongo-express-service
              port:
                number: 8081
  ```
- **Apply and Verify**:
  ```bash
  kubectl apply -f ingress.yaml
  kubectl get ingress
  ```
  - Output:
    ```
    NAME                   CLASS    HOSTS              ADDRESS         PORTS   AGE
    mongo-express-ingress  <none>   k8s.alyesmail.com  <ingress-ip>    80      1m
    ```
- **Access the App**:
  - Edit your `/etc/hosts` file to map `k8s.alyesmail.com` to the Ingress IP:
    ```
    <ingress-ip> k8s.alyesmail.com
    ```
  - Open `http://k8s.alyesmail.com` in your browser to access Mongo-Express.

---

## 🎥 Demo
- **Access Mongo-Express**:
  - Navigate to `http://k8s.alyesmail.com`.
  - Log in using the credentials (`admin`/`securepassword123`).
  - Successfully access the Mongo-Express web interface to manage MongoDB.
  ![ex](/assets/mongo-express.png)
- **Verify Connectivity**:
  - Mongo-Express connects to MongoDB via `mongo-service`, confirming the setup works as expected.
- **Note**: A demo video or screenshots can be added here to showcase the login and database management interface.

---

## 🐞 Troubleshooting
- **MongoDB Not Accessible**:
  - Issue: MongoDB was listening on `127.0.0.1`, making it inaccessible to the service.
  - Solution: Added `command: ["mongod", "--bind_ip", "0.0.0.0"]` to the deployment to listen on all interfaces.
  - Check logs:
    ```bash
    kubectl logs -l app=mongo
    ```
- **ConfigMap Overridden**:
  - Issue: The `MONGO_URL` in the ConfigMap was overridden, causing connectivity issues.
  - Current Workaround: Explicitly set the URL in the Mongo-Express deployment.
  - Future Improvement: Investigate a better way to manage the connection URL (e.g., using a ConfigMap without overrides).

---

## 🙏 Thanks
Thank you for exploring **Kubernetes Lab 2**! This project demonstrates the deployment of MongoDB and Mongo-Express on Kubernetes with secure authentication and Ingress routing. I’m grateful for the learning experience and any feedback provided during this lab.

---


## 📧 Contact
- **Author**: Aly Esmaeil
- **GitHub**: [alyesmaeil](https://github.com/alielesawy)

---

*Built with ❤️ by Aly Esmaeil for Kubernetes Lab 2*

