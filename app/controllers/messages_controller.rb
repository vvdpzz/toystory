class MessagesController < ApplicationController
  include ActionView::Helpers::DateHelper
  
  def index
    
  end
  def conversations
    
  end
  
  def load_conversations
    conversation_list = $redis.zrange("messages:#{current_user.id}", 0, -1)
    last_conver_msg_list = []
    conversation_list.each do |conver_id|
      key = "messages:#{current_user.id}:#{conver_id}"
      last_message = MultiJson.decode($redis.lrange(key, -1, -1)[0])
      hash = {}
      unread_count = $redis.get(key + ":unreadcount")
      hash[:unread_message_count] = unread_count
      if current_user.id == last_message["sender_id"]
        hash[:last_message_is_outgoing] = true
      else
        hash[:last_message_is_outgoing] = false
      end
      hash[:last_message]   = last_message["text"]
      if conver_id == last_message["sender_id"]
        hash[:friend_name]    = last_message["sender_name"]
      else
        hash[:friend_name]    = last_message["receiver_name"]
      end
      hash[:friend_token]   = conver_id
      hash[:friend_picture] = "/assets/default-profile-photo.png"
      hash[:last_update]    = time_ago_in_words(Time.parse last_message["created_at"]) + " ago"
      last_conver_msg_list  << hash
    end
    render :json => { :conversations => last_conver_msg_list, :rc => 0 }
  end
  
  def remove_conversation
    friend_id = params[:friend_token]
    $redis.del("messages:#{current_user.id}:#{friend_id}:unreadcount")
    $redis.del("messages:#{current_user.id}:#{friend_id}")
    $redis.zrem("messages:#{current_user.id}", friend_id)
    render :json => { :rc => 0 }
  end
  
  def messages
    @friend = User.select("username").find_by_id params[:friend_token]
  end
  
  def load_messages
    friend_id = params[:friend_token]
    message_list = []
    message_list_redis = $redis.lrange("messages:#{current_user.id}:#{friend_id}", 0, -1)
    message_list_redis.each do |message_redis|
      message_redis_hash = MultiJson.decode(message_redis)
      message = {}
      message[:owner_picture]     = "/assets/default-profile-photo.png"
      message[:text]              = message_redis_hash["text"]
      message[:owner_profile_url] = ""
      message[:time_created]      = time_ago_in_words(Time.parse message_redis_hash["created_at"]) + " ago"
      message[:owner_name]        = message_redis_hash["sender_name"]
      message_list << message
    end
    $redis.set("messages:#{current_user.id}:#{friend_id}:unreadcount", 0)
    render :json => { :messages => message_list, :rc => 0 }
    
  end
  
  def send_message
    sender    = User.basic(current_user.id)
    receiver  = User.basic(params[:recipient_token])
    
    hash = {}
    hash[:created_at]     = Time.now
    hash[:text]           = params[:text]
    hash[:sender_id]      = sender.id.to_s
    hash[:sender_name]    = sender.username
    
    $redis.rpush("messages:#{receiver.id}:unread_messages", MultiJson.encode(hash))
    Pusher["presence-channel_#{receiver.id}"].trigger('message_created', MultiJson.encode(hash))
    
    hash[:receiver_id]    = receiver.id.to_s
    hash[:receiver_name]  = receiver.username
    
    sender_conver_timecount    = $redis.incr("messages:#{sender.id}:count")
    receiver_conver_timecount  = $redis.incr("messages:#{receiver.id}:count")
    $redis.zadd("messages:#{sender.id}", sender_conver_timecount, "#{receiver.id}")
    $redis.zadd("messages:#{receiver.id}", receiver_conver_timecount, "#{sender.id}")
    $redis.rpush("messages:#{sender.id}:#{receiver.id}", MultiJson.encode(hash))
    $redis.rpush("messages:#{receiver.id}:#{sender.id}", MultiJson.encode(hash))
    
    $redis.incr("messages:#{receiver.id}:#{sender.id}:unreadcount")
    $redis.incr("messages:#{receiver.id}:unreadcount")
    
    render :json => { :outgoing => "", :rc => 0 }    
  end
  
  def remove_message
    
  end
  
  def update_last_viewed
    $redis.del("messages:#{current_user.id}:unread_messages")
    $redis.del("messages:#{current_user.id}:unreadcount")
    render :json => { :rc => 0 }
  end
  
  def load_messages_on_navbar
    unread_message_list = $redis.lrange("messages:#{current_user.id}:unread_messages", 0, -1)
    unread_message_list.collect! do |message|
      MultiJson.decode(message)
    end
    unread_count = $redis.get("messages:#{current_user.id}:unreadcount")
    render :json => { :count => unread_count, :messages => unread_message_list, :rc => 0 }
  end
  
  def load_contact_list
    contact_list = $redis.hvals("users:#{current_user.id}.following_users.info")
    contact_list.collect! { |user| MultiJson.decode(user) }
    render :json => { :contact_list => contact_list }
  end
end
