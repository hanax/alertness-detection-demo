Hacky webapp to detect heartrate with a camera
[demo](https://www.youtube.com/watch?v=VcHessb7o9M)
```
# 1. start client server and open the page
# 2. auth gcloud
gcloud auth application-default login
# 3. start pulse app and start udp server
npm start
# 4. hit S on the pulse app and wait for the heartbeat to stablize
# 5. get results from node console
```