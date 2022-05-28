import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import wrtc from "wrtc";
import {WebRTCStar} from "@libp2p/webrtc-star";
import {Mplex} from '@libp2p/mplex'
import {NOISE, Noise} from "@chainsafe/libp2p-noise"
import {Bootstrap} from "@libp2p/bootstrap"
import {Libp2pOptions} from "libp2p";
import {PreSharedKeyConnectionProtector} from "libp2p/pnet"
import * as config from "config"
import * as fs from "fs"
import {createEd25519PeerId} from '@libp2p/peer-id-factory'
import {peerIdFromBytes,peerIdFromPeerId} from '@libp2p/peer-id'
import {FULA_NODES, IPFS_HTTP, LIBP2P_PATH} from "./const.js";
import {TCP} from '@libp2p/tcp'
import {WebSockets} from '@libp2p/websockets'

const getPeerId = async () => {
    if (fs.existsSync(LIBP2P_PATH + '/identity.json')) {
        const buf = fs.readFileSync(LIBP2P_PATH + '/identity.json')
        return peerIdFromBytes(buf)
    } else {
        const identity = peerIdFromPeerId(await createEd25519PeerId())
        fs.writeFileSync(LIBP2P_PATH + '/identity.json', identity.toBytes())
        return identity
    }

}
const getNetSecret = ()=> {
    if(config.get("network.key_path")===""){
        return undefined
    }
    console.log("Private Mode Enabled")
    const key = fs.readFileSync(config.get("network.key_path"))
    return new PreSharedKeyConnectionProtector({psk:key})
}
export const netSecret = getNetSecret()
export const listen : Array<string> = config.get("network.listen")

new Noise();

export const libConfig = async (config: Partial<Libp2pOptions>): Promise<Libp2pOptions> => {
    const conf = {
        ...config,
        addresses: {
            listen
        },
        modules: {
            transport: [WebRTCStar, TCP, WebSockets],
            streamMuxer: [Mplex],
            connEncryption: [NOISE],
            peerDiscovery: [Bootstrap],
            pubsub: GossipSub,
            connProtector: netSecret
        },
        config: {
            transport: {
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    wrtc, // You can use `wrtc` when running in Node.js
                },
            },
            peerDiscovery: {
                autoDial: true,
                [WebRTCStar.prototype[Symbol.toStringTag]]: {
                    enabled: false,
                },
                [Bootstrap.tag]: {
                    list: FULA_NODES,
                    interval: 5000,
                    enabled: FULA_NODES.length > 0
                }
            },
        },
    }
    if(IPFS_HTTP){
        return {
            ...conf,
          peerId:await getPeerId()
        }
    }
    else return conf
}

export const ipfsConfig = () => ({
    Addresses: {
        Swarm: listen,
        Announce: [],
        NoAnnounce: [],
        API: '/ip4/127.0.0.1/tcp/5002',
        Gateway: '/ip4/127.0.0.1/tcp/9090',
        RPC: '/ip4/127.0.0.1/tcp/5003',
    },
    Discovery: {
        MDNS: {
            Enabled: true,
            Interval: 10
        },
        webRTCStar: {
            Enabled: false
        }
    },
    Bootstrap: FULA_NODES,
    Pubsub: {
        /** @type {'gossipsub'} */
        Router: ('gossipsub'),
        Enabled: true
    },
    Swarm: {
        ConnMgr: {
            LowWater: 1,
            HighWater: 10
        },
        DisableNatPortMap: false
    },
    Routing: {
        Type: 'dhtclient'
    }
})
