class ProfileController < ApplicationController
  def follow_user
    if user = User.select("id,username,picture").find_by_id params[:uid]
      $redis.sadd("users:#{current_user.id}.follow_users", params[:uid])
      $redis.hset("users:#{current_user.id}.follow_users.info", params[:uid], MultiJson.encode(user))
      render :json => {:msg => "", :rc => 0}
    else
      render :json => {:msg => "关注失败", :rc => 1}
    end 
  end
  
  def unfollow_user
    if User.select("id").find_by_id params[:uid] && $redis.sismember("users:#{user_id}.follow_users", params[:uid])
      $redis.serm("users:#{current_user.id}.follow_users", params[:uid])
      $redis.hdel("users:#{current_user.id}.follow_users.info", params[:udi])
      render :json => {:result => [1, 1], :rc => 0}
    else
      render :json => {:msg => "取消关注失败", :rc => 1}
    end
  end
  
  def follow_contest
    if Contest.select("id").find_by_id params[:cid]
      $redis.sadd("users:#{current_user.id}.follow_contests", params[:cid])
      render :json => {:msg => "", :rc => 0}
    else
      render :json => {:msg => "关注失败", :rc => 1}
    end
  end
  
  def unfollow_contest
    if Contest.select("id").find_by_id params[:cid] && $redis.sismember("users:#{current_user.id}.follow_contests", params[:cid])
      $redis.sadd("users:#{current_user.id}.follow_contests", params[:cid])
      render :json => ""
    else
      render :json => {:msg => "关注失败", :rc => 1}
    end
  end
  
  def update_username
    if current_user.update_attribute(:username, params[:username])
      render :json => {:result => current_user.username, rc => 0}
    else
      render :json => {:msg => "更新错误", rc => 1}
  end
  
  def update_description
    if current_user.profile.update_attribute(:description, params[:description])
      render :json => {:result => current_user.description, rc => 0}
    else
      render :json => {:msg => "更新错误", rc => 1}    
  end
  
  def update_location
    if current_user.profile.update_attribute(:location, params[:location])
      render :json => {:result => current_user.location, rc => 0}
    else
      render :json => {:msg => "更新错误", rc => 1}    
  end
   
  def update_introduction
    if current_user.profile.update_attribute(:introduction, params[:introduction])
      render :json => {:result => current_user.introduction, rc => 0}
    else
      render :json => {:msg => "更新错误", rc => 1}    
  end
  
  def update_website
    if current_user.profile.update_attribute(:introduction, params[:introduction])
      render :json => {:result => current_user.introduction, rc => 0}
    else
      render :json => {:msg => "更新错误", rc => 1}    
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
end
