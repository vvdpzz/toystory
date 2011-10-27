module ApplicationHelper
  def is_followed?(uid)
    $redis.sismember("users:#{current_user.id}.following_users", uid)
  end
end
