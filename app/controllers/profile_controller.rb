class ProfileController < ApplicationController
  before_filter :get_current_user_profile, :only => [:update_description, :update_location, :update_introduction, :update_website]
  def follow_user
    if user = User.select("id,username,picture").find_by_id(params[:uid])
      $redis.sadd("users:#{current_user.id}.following_users", params[:uid])
      $redis.sadd("users:#{params[:uid]}.follower_users", current_user.id)
      $redis.hset("users:#{current_user.id}.following_users.info", params[:uid], MultiJson.encode(user))
      render json: {msg: "", rc: 0}
    else
      render json: {msg: "follow faild", rc: 1}
    end 
  end
  
  def unfollow_user
    if User.select("id").find_by_id(params[:uid]) && $redis.sismember("users:#{current_user.id}.following_users", params[:uid])
      $redis.srem("users:#{current_user.id}.following_users", params[:uid])
      $redis.srem("users:#{params[:uid]}.follower_users", current_user.id)
      $redis.hdel("users:#{current_user.id}.following_users.info", params[:udi])
      render json: {result: [1, 1], rc: 0}
    else
      render json: {msg: "unfollow faild", rc: 1}
    end
  end
  
  def follow_contest
    if Contest.select("id").find_by_id(params[:cid])
      $redis.sadd("users:#{current_user.id}.following_contests", params[:cid])
      $redis.sadd("contests:#{params[:cid]}.follower_users", current_user.id)
      render json: {msg: "", rc: 0}
    else
      render json: {msg: "follow faild", rc: 1}
    end
  end
  
  def unfollow_contest
    if Contest.select("id").find_by_id(params[:cid]) && $redis.sismember("users:#{current_user.id}.following_contests", params[:cid])
      $redis.srem("users:#{current_user.id}.following_contests", params[:cid])
      $redis.srem("contests:#{params[:cid]}.follower_users", current_user.id)
      render nothing: true
    else
      render json: {msg: "follow faild", rc: 1}
    end
  end
  
  def update_username
    if current_user.update_attribute(:username, params[:username])
      render json: {result: current_user.username, rc: 0}
    else
      render json: {msg: "update error", rc: 1}
    end
  end
  
  def update_description
    if @profile.update_attribute(:description, params[:description])
      render json: {result: @profile.description, rc: 0}
    else
      render json: {msg: "update error", rc: 1} 
    end   
  end
  
  def update_location
    if @profile.update_attribute(:location, params[:location])
      render json: {result: @profile.location, rc: 0}
    else
      render json: {msg: "update error", rc: 1}   
    end 
  end
   
  def update_introduction
    if @profile.update_attribute(:introduction, params[:introduction])
      render json: {result: @profile.introduction, rc: 0}
    else
      render json: {msg: "update error", rc: 1}   
    end 
  end
  
  def update_website
    website = params[:website].strip
    if website.present? and not website.start_with?("http://")
      website = "http://#{website}"
    end
    if @profile.update_attribute(:website, website)
      render json: {result: @profile.website, rc: 0}
    else
      render json: {msg: "update error", rc: 1}
    end    
  end
  
  def update_categories
    
  end

  def block_user
    
  end

  def unblock_user
    
  end

  def suspend_user
    
  end

  def unsuspend_user
    
  end
  
  def update_user_photo
    
  end
  
  def delete_user_photo
    
  end
  
  def send_vrf_email
    
  end
  
  def verify_sms_code
    
  end
  
  def load_users
    if params[:direction] == "1" 
      uids = $redis.smembers("users:#{params[:uid]}.follower_users")
    else
      uids = $redis.smembers("users:#{params[:uid]}.following_users")
    end
    @users = User.find(uids, :include => :profile)
    if @users.present?
      render partial: "user", :collection => @users, layout: false
    else
      render nothing: true
    end
  end
  
  def load_contests
    cids = $redis.smembers("users:#{params[:uid]}.following_contests")
    @contests = Contest.find(cids)
    if @contests.present?
      render partial: "contest", :collection => @contests, layout: false
    else
      render nothing: true
    end
  end
  
  def photo_upload_response
    current_user.picture = params[:Filedata]
    if current_user.save
      render :json => {:picture => current_user.picture.url}
    end
  end
  
  protected
    def get_current_user_profile
      @profile = current_user.profile
    end
end
