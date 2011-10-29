class NotificationsController < ApplicationController
  include ActionView::Helpers::DateHelper
  def index
    @notification_list = $redis.lrange("notifications:#{current_user.id}", 0, -1)
    @notification_list.collect! do |notification_json|
      notification = MultiJson.decode(notification_json)
      created_at = Time.parse(notification["created_at"])
      notification["date"] = created_at.strftime("%Y-%m-%d")
      notification["time"] = created_at.strftime("%H:%M:%S")
      notification
    end
    @first = @notification_list[0]
    
  end
  
  def load_notifications
    notification_list = $redis.lrange("notifications:#{current_user.id}", 0, -1)
    notification_list.collect! do |notification_json|
      notification = MultiJson.decode(notification_json)
      created_at = Time.parse(notification["created_at"])
      notification["created_at"] = time_ago_in_words(created_at) + " ago"
      notification
    end
    unread_count = $redis.get("notifications:#{current_user.id}:unreadcount")
    
    render :json => { :count => unread_count, :notifications => notification_list }
  end
  
  def set_all_seen
    $redis.del("notifications:#{current_user.id}:unreadcount")
    
    render :json => { :rc => 0}
  end
  
end