// building graphql model

class Graphql_client {

    constructor(sessionId, mb_id) {
        this.sessionId = sessionId;
        this.mb_id = mb_id;
        this.subChannels = null;
        this.subMessages = null;
        // this.graphql_url = 'localhost:4003/graphql'; // when running graphql server on local machine
        this.graphql_url = '45.13.132.208:4003/graphql'; // when running graphql server on martin:vps_ubuntu
        this.graphql = null;
        this.apollo = null;
        this.apolloClient = null;
        this.subscriptionsClient = null;
    }

    setLibraryObjects(graphql, Apollo) {
        this.graphql = graphql;
        this.Apollo = Apollo;
    }

    async startGraphQl(callback) {

        // graphql.js usage
        // via graphql.js@0.5.0
        this.graph = this.graphql('http://' + this.graphql_url, {
            headers: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
                "this": "that"
            },
            asJSON: true
        });

        // apollo client usage
        // via apollo-client-browser@1.9.0
        this.apolloClient = new this.Apollo.lib.ApolloClient({
            networkInterface: this.Apollo.lib.createNetworkInterface({
                uri: 'http://' + this.graphql_url,
                transportBatching: true,
            }),
            connectToDevTools: true,
        });

        // Client WEBSOCKET subscription into GraphQL server
        // via subscriptions-transport-ws@0.9.18
        this.subscriptionsClient = new window.SubscriptionsTransportWs.SubscriptionClient('ws://' + this.graphql_url, {
            reconnect: true,
            connectionParams: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
            }
        });
        this.subscriptionsClient.onConnected(() => {
            console.log('subscriptionsClient Connected!!');
        });
        this.subscriptionsClient.onReconnected(() => {
            console.log('subscriptionsClient Reconnected!!');
        });
        this.subscriptionsClient.onError(() => {
            console.log('subscriptionsClient Error!!');
        });

        this.subscribeChannel(result => {
            callback(result);
        });
    }

    endGraphql() {
        this.subscriptionsClient.close();
    }

    subscribeChannel(callback) {
        const SUB_QUERY = this.Apollo.gql`subscription($mb_id: String!) {
                updateChannel(mb_id: $mb_id) {
                    type
                    is_active
                    channel_id
                    channel_title
                    date_created
                    message_index
                    opener_mb_id
                    invitees_mb_id
                    opener_last_message_index
                    invitees_last_message_index
                    opener_last_message_date
                    invitees_last_message_date

                    users {
                        mb_id
                        mb_nick
                        mb_level
                    }
                    messages {
                        index
                        mb_id
                        content
                        date_created
                    }
                }
            }`;

        this.subChannels = this.subscriptionsClient.request({
            query: SUB_QUERY,
            variables: {"mb_id": this.mb_id}
        }).subscribe({
            next: (res) => {
                console.log('<-------------- SUBS: updateChannel --------------->')
                let str_channel_id = res.data.updateChannel.channel_id;
                let str_type = res.data.updateChannel.type ? res.data.updateChannel.type : "";
                let str_messages = res.data.updateChannel.messages[0] ? res.data.updateChannel.messages[0].content : '등록된 글이 없습니다.';
                let str = `<div>[${str_channel_id}] :: ${str_type} - ${str_messages}</div>`;
                callback(res.data)
            },
            error: console.error
        });
    }

    async getChannels(mb_id) {
        try {
            let response = await this.graph(`query Channels($mb_id: String!) {
                    channels(mb_id: $mb_id) {
                        type
                        is_active
                        channel_id
                        channel_title
                        channel_type
                        is_active
                        date_created
                        date_last_update
                        message_index
                        opener_mb_id
                        opener_is_active
                        opener_last_message_index
                        opener_last_message_date
                        invitees_mb_id
                        invitees_is_active
                        invitees_last_message_index
                        invitees_last_message_date
        
                        users {
                            mb_id
                            mb_nick
                            mb_level                    
                        }
                        messages(limit: 1) {
                            index
                            channel_id
                            mb_id                    
                            content
                            date_created
                        }
                    }
                }`, {
                "mb_id": mb_id,
            })
            //console.log(response);

            if (response.channels) {
                return response.channels;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err)
        }
    }

    async createChannel(invitees_mb_id) {
        // f/graphql.js usage
        this.graph = graphql('http://' + this.graphql_url, {
            headers: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
            },
            asJSON: true
        })

        try {
            const response = await this.graph(`mutation CreateChannel($input: ChannelInput!) {
                    createChannel(input: $input) {
                        id,
                        is_active
                        channel_id,
                        channel_type,
                        is_active,
                        date_created,
                        date_last_update,
                        message_index,
                        opener_mb_id,
                        invitees_mb_id
                    }
                }`, {
                "input": {
                    "channel_type": "OTO",
                    "opener_mb_id": this.mb_id,
                    "invitees_mb_id": invitees_mb_id,
                }
            });
            return response;
        } catch (err) {
            return err[0];
        }
    }

    async deleteChannel(channel_id) {
        try {
            let response = await this.graph(`mutation DeleteChannel($id: ID!) {
                    deleteChannel(id: $id) {
                        id,
                        channel_id,
                        channel_type,
                        is_active,
                        date_created,
                        date_last_update,
                        message_index,
                        opener_mb_id,
                        invitees_mb_id
                    }
                }`, {
                "id": channel_id,
                // "id": $('#channel_id').val(),
            });
            //console.log(response);

            if (response.deleteChannel) {
                return response.deleteChannel;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

    async getBlacklist() {
        try {
            let response = await this.graph(`query Users($type: String!, $start_at: Int, $limit: Int) {
                    users(type: $type, start_at: $start_at, limit: $limit) {
                        mb_id
                        mb_nick
                        mb_level
                    }
                }`, {
                "type": "blacklist",
            });
            //console.log(response);

            if (response.users) {
                return response.users;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

    async addBlacklist(invitees_mb_id) {
        try {
            let response = await this.graph(`mutation AddBlacklist($mb_id: String!) {
                    addBlacklist(mb_id: $mb_id) {
                        mb_id
                        mb_nick
                        mb_level
                        blacklist
                    }
                }`, {
                "mb_id": invitees_mb_id
            });
            //console.log(response);

            return true;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async removeBlacklist(invitees_mb_id) {
        try {
            let response = await this.graph(`mutation RemoveBlacklist($mb_id: String!) {
                    removeBlacklist(mb_id: $mb_id) {
                        mb_id
                        mb_nick
                        mb_level
                        blacklist
                    }
                }`, {
                "mb_id": invitees_mb_id
            });
            //console.log(response);

            return true;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async refillChannelTicket(refill_type) {
        try {
            const response = await this.graph(`mutation RefillChannelTicket($type: String!) {
                    refillChannelTicket(type: $type) {
                        mb_id
                        count_channel_ticket
                    }
                }`, {
                type: refill_type
            });
            //console.log(response);

            if (response.refillChannelTicket) {
                return response.refillChannelTicket;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

    async getMessages(channel_id) {
        try {
            let response = await this.graph(`query Messages($channel_id: String!, $start_at: Int, $limit: Int) {
                    messages(channel_id: $channel_id, start_at: $start_at, limit: $limit) {
                        index,
                        mb_id,
                        content,
                        date_created
                    }
                }`, {
                "channel_id": channel_id,
                "start_at": 100000,
                "limit": 300
            });
            //console.log(response);

            if (response.messages) {
                return response.messages;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

    async sendMessage(channel_id, message) {
        try {
            let response = await this.graph(`mutation CreateMessage($input: MessageInput!) {
                    createMessage(input: $input) {
                        id,
                        content,
                        date_created
                        type
                        channel_id
                        mb_id
                    }
                }`, {
                "input": {
                    "channel_id": channel_id,
                    "mb_id": this.mb_id,
                    "content": message
                }
            });
            //console.log(response);

            return true;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    enterChannel(channel_id, callback) {
        console.log('* gClient enterChannel function executed *')
        const SUB_QUERY = this.Apollo.gql`subscription($channel_id: String!) {
                updateMessage(channel_id: $channel_id) {
                    type
                    index
                    id
                    mb_id
                    content
                    date_created
                    channel_id
                }
            }`;
        this.subMessages = this.subscriptionsClient.request({
            query: SUB_QUERY,
            variables: {"channel_id": channel_id}
        }).subscribe({
            next: (res) => {
                console.log('<-------------- SUBS: updateMessage --------------->')
                callback(res.data);
            },
            error: console.error
        });
    }

    async leaveChannel(channel_id) {
        try {
            if (this.subMessages) this.subMessages.unsubscribe();
            if (activeChannelId) await this.setUserActive("N", channel_id);
            return true;
        } catch (err) {
            console.log(err);
        }
    }

    async setUserActive(isActive, channel_id) {
        try {
            let response = await this.graph(`mutation UpdateChannel($input: ChannelInput!) {
                    updateChannel(input: $input) {
                        id
                        channel_id
                        date_created                        
                        users(type: "*") {
                            mb_id
                            mb_nick
                            mb_level
                            count_channel_ticket
                        }
                    }
                }`, {
                "input": {
                    "channel_id": channel_id,
                    "is_active": isActive
                }
            });
            //console.log(response);

            if (response.updateChannel) {
                return response.updateChannel;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

    async getUser(type, keyword) {
        try {
            let response = await this.graph(`query User($type: String!, $keyword: String!) {
                    user(type: $type, keyword: $keyword) {
                        mb_id
                        mb_nick
                        mb_level
                        count_channel_ticket
                        blacklist
                    }
                }`, {
                "type": type,
                "keyword": keyword,
            });
            //console.log(response);

            if (response.user) {
                return response.user;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
        }
    }

}

export default Graphql_client

