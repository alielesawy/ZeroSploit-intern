
# Kubernetes Lab 3: Deploying a Full-Stack Todo Application

![Kubernetes Lab 3 Banner](/assets/banner.png)

---

## 📖 Overview

This project, **Kubernetes Lab 3**, involves deploying a full-stack Todo application on a Kubernetes cluster. The application is a refactored version of a previous task, with added features, improved design, and persistent storage for both the database and static files. The deployment ensures scalability, reliability, and data persistence using Kubernetes best practices.

### Task
- Deploy a full-stack Todo application I developed.
- Ensure static data (images) is persistent.
- Set up a database with persistent storage.

### Development
- Refactored the full-stack application from a [previous task](https://github.com/alielesawy/SBMRD-Todo/tree/main).
- Added features like logout functionality.
- Updated the style and design, including new images and icons.
- Prepared the application environment for containerization with Docker.
- Pushed images to Docker Hub for future use.

---

## 🛠️ Technology Stack

- **Backend**:
  - Java
  - Spring Boot
  - Maven
- **Frontend**:
  - NodeJS
  - React
  - CSS
  - NGINX (as a reverse proxy)
- **Database**:
  - MongoDB
- **Containerization and Orchestration**:
  - Docker
  - Kubernetes

---

## 📂 Project Structure

```

└── k8s/lab3                       # Kubernetes manifests
    ├── mongo-secrets.yaml     # Secrets for MongoDB credentials
    ├── mongo-configmap.yaml   # ConfigMap for MongoDB configuration
    ├── mongo-pvc-stateful.yaml # MongoDB StatefulSet
    ├── mongo-service.yaml     # MongoDB Service
    ├── backend-deployment-service.yaml # Backend Deployment and Service
    ├── frontend-images-pvc.yaml # PVC for frontend images
    ├── frontend-deployment-service.yaml # Frontend Deployment and Service
    └── ingress.yaml           # Ingress for routing
```

---

## 🚀 Work Through Overview

### 1. Creating Secrets to Store Credentials
- **Purpose**: Securely store MongoDB credentials (username and password).
- **Implementation**:
  - Encoded the username (`admin`) and password (`pass`) in a Secret.
  - File: `mongo-secrets.yaml`
    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: mongo-secrets
    type: Opaque
    stringData:
      mongo-username: "admin"
      mongo-password: "pass"
    ```
- **Verification**:
  ```bash
  kubectl get secret mongo-secrets -o yaml
  ```

### 2. Creating ConfigMap to Store Non-Credential Data
- **Purpose**: Store non-sensitive MongoDB configuration (host, port, database name).
- **Implementation**:
  - File: `mongo-configmap.yaml`
    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: mongo-config
    data:
      SPRING_DATA_MONGODB_HOST: "mongo"
      SPRING_DATA_MONGODB_PORT: "27017"
      SPRING_DATA_MONGODB_DATABASE: "todo_db"
    ```
- **Verification**:
  ```bash
  kubectl get configmap mongo-config -o yaml
  ```

### 3. StatefulSet for MongoDB
- **Purpose**: Deploy MongoDB as a stateful application.
- **Why StatefulSet?**:
  - Ensures each pod has a stable and unique identity, which is critical for databases.
  - Manages PVCs for each pod to ensure data persistence.
- **Implementation**:
  - File: `mongo-pvc-stateful.yaml`
    - Creates a StatefulSet for MongoDB.
    - Uses environment variables from `mongo-secrets` for initialization.
    - Mounts a PVC (`mongo-data-mongo-0`) at `/data/db` for persistence.
    - Uses the `rook-cephfs` StorageClass to provision the PVC.
  ```yaml
  volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: rook-cephfs
      resources:
        requests:
          storage: 5Gi
  ```

### 4. MongoDB Service
- **Purpose**: Provide a stable network endpoint for MongoDB.
- **Implementation**:
  - File: `mongo-service.yaml`
  - Uses a headless service (`ClusterIP: None`) to allow direct communication with MongoDB pods, ideal for databases.
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mongo
  spec:
    clusterIP: None
    ports:
    - port: 27017
      targetPort: 27017
    selector:
      app: mongo
  ```

### 5. Backend Deployment and Service
- **Service**:
  - Type: `ClusterIP`.
  - Matches the container port (`8080`) in the deployment.
- **Deployment**:
  - Uses the image `alyesmaeil/backend-todo:latest`.
  - Configures MongoDB credentials from `mongo-secrets`.
  - Configures connection details (host, port, database) from `mongo-config`.
  - File: `backend-deployment-service.yaml`

### 6. PVC for Static Files
- **Purpose**: Store static files (images) persistently for the frontend.
- **Implementation**:
  - File: `frontend-images-pvc.yaml`
  - Uses the `rook-cephfs` StorageClass.
  - Access mode: `ReadWriteMany` to allow multiple pods to access the images.
  ```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: frontend-images-pvc
  spec:
    storageClassName: rook-cephfs
    accessModes:
      - ReadWriteMany
    resources:
      requests:
        storage: 1Gi
  ```
- **Verification**:
  ```bash
  kubectl get pvc
  ```
  - Output:
    ```
    NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    mongo-data-mongo-0   Bound    pvc-44f6b17d-7cb8-42fc-b646-a410e9466146   5Gi        RWO            rook-cephfs    13h
    frontend-images-pvc  Bound    pvc-<id>                                   1Gi        RWX            rook-cephfs    13h
    ```
- **Describe PVCs**:
  - MongoDB PVC:
    ```bash
    kubectl describe pvc mongo-data-mongo-0
    ```
  - Static Files PVC:
    ```bash
    kubectl describe pvc frontend-images-pvc
    ```

### 7. Frontend Deployment and Service
- **Deployment**:
  - Uses an `initContainer` to copy static files (images) from the container to the PVC.
  - **Why `initContainer`?**:
    - The PVC starts empty, and mounting it at `/usr/share/nginx/html/images` would overwrite the container’s images directory.
    - The `initContainer` copies the images to the PVC before the main container starts, ensuring persistence.
  - Uses the same image (`alyesmaeil/frontend-todo:latest`) for both the `initContainer` and main container.
  - Sets the environment variable `REACT_APP_API_URL=/api` for frontend-backend communication.
- **Service**:
  - Type: `ClusterIP`.
  - Exposes port `80`.
- **File**: `frontend-deployment-service.yaml`

### 8. Ingress
- **Purpose**: Route external traffic to the frontend and backend.
- **Implementation**:
  - File: `ingress.yaml`
  - Routes `/` to the frontend and `/api` to the backend.
  - Accessible at `todo.example.com`.
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: todo-ingress
  spec:
    ingressClassName: nginx
    rules:
    - host: todo.example.com
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: frontend
              port:
                number: 80
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: backend
              port:
                number: 8080
  ```

---

## 📊 Resource View

### All Resources
```bash
kubectl get all -o wide
```
- Output:
  ```
  NAME                            READY   STATUS    RESTARTS   AGE   IP               NODE     NOMINATED NODE   READINESS GATES
  pod/backend-6cb9f65548-pnz5x    1/1     Running   0          42s   192.168.84.153   node-1   <none>           <none>
  pod/frontend-589f97b554-kb99x   1/1     Running   0          28s   192.168.247.24   node-2   <none>           <none>
  pod/mongo-0                     1/1     Running   0          59s   192.168.247.51   node-2   <none>           <none>

  NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)     AGE   SELECTOR
  service/backend    ClusterIP   10.99.90.54    <none>        8080/TCP    42s   app=backend
  service/frontend   ClusterIP   10.96.10.176   <none>        80/TCP      28s   app=frontend
  service/mongo      ClusterIP   None           <none>        27017/TCP   54s   app=mongo

  NAME                       READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES                            SELECTOR
  deployment.apps/backend    1/1     1            1           42s   backend      alyesmaeil/backend-todo:latest    app=backend
  deployment.apps/frontend   1/1     1            1           28s   frontend     alyesmaeil/frontend-todo:latest   app=frontend

  NAME                                  DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES                            SELECTOR
  replicaset.apps/backend-6cb9f65548    1         1         1       42s   backend      alyesmaeil/backend-todo:latest    app=backend,pod-template-hash=6cb9f65548
  replicaset.apps/frontend-589f97b554   1         1         1       28s   frontend     alyesmaeil/frontend-todo:latest   app=frontend,pod-template-hash=589f97b554

  NAME                     READY   AGE   CONTAINERS   IMAGES
  statefulset.apps/mongo   1/1     59s   mongo        mongo:latest
  ```

### Ingress
```bash
kubectl get ingress
```
- Output:
  ```
  NAME           CLASS    HOSTS              ADDRESS         PORTS   AGE
  todo-ingress   <none>   todo.example.com   <ingress-ip>    80      1h
  ```
- **Access the App**:
  - Add the following to your `/etc/hosts` file:
    ```
    <ingress-ip> todo.example.com
    ```
  - Open `http://todo.example.com` in your browser.

---

## 🎥 Demo
![login](/assets/register.png)
### Login and Register Page
1. **Register a New User**:
   - Navigate to the registration page.
   - Register a new user with username `admin` and password `pass`.
   - A confirmation message appears: "Registration successful."
![login](/assets/reg-success.png)

2. **Login**:
   - Log in with `admin` and `pass`.
   - Successfully logged in, redirected to the Todo list.

3. **Task Management**:
   - Add new tasks.
    ![task](/assets/add-tasks.png)
   - Complete and delete some tasks.

    ![task](/assets/comp-del-task.png)


### Persistence Test: MongoDB PVC
1. **Delete the MongoDB Pod**:
   ```bash
   kubectl delete pod mongo-0
   ```
   - Kubernetes recreates the pod.

2. **Log In Again**:
   - Log in with `admin` and `pass`.
   - The same tasks are still present, confirming that the MongoDB PVC (`mongo-data-mongo-0`) ensures data persistence.

### Persistence Test: Static Files PVC
- **Challenge**: No access to worker nodes to directly verify the PVC.
- **Workaround**:
  - Create a temporary pod to mount the `frontend-images-pvc` and explore its contents.
  - File: `explore-pvc-pod.yaml`
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: explore-pvc
    spec:
      containers:
      - name: explore-container
        image: busybox
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
        - name: pvc-data
          mountPath: /mnt/pvc
      volumes:
      - name: pvc-data
        persistentVolumeClaim:
          claimName: frontend-images-pvc
    ```
  - Apply and explore:
    ```bash
    kubectl apply -f explore-pvc-pod.yaml
    kubectl exec -it explore-pvc -- ls /mnt/pvc
    ```
    - Output: `cyberpunk-bg.jpg` (and other images).
  - **Result**: The PVC is mounted correctly, confirming that static files are persistent.

---

## 🙏 Thanks
Thank you for exploring **Kubernetes Lab 3**! This project demonstrates the deployment of a full-stack application with persistent storage, secure configuration, and modern DevOps practices. Special thanks to anyone who provided guidance or support during this lab.

---


## 📧 Contact
- **Author**: Aly Esmaeil
- **GitHub**: [alyesmaeil](https://github.com/alielesawy)

---

*Built with ❤️ by Aly Esmaeil for Kubernetes Lab 3*
