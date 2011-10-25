class AutosaveController < ApplicationController
  def save_creation
    key = params[:key].to_i
    hash = {title: params[:title], content: params[:content]}
    key = UUIDList.pop if key == 0
    $redis.hset "users:#{current_user.id}.autosave_creation", key, MultiJson.encode(hash)
    render json: {key: key, rc: 0}
  end
  
  def discard_creation
    $redis.hdel "users:#{current_user.id}.autosave_creation", params[:key]
    render nothing: true
  end
  
  def save_entry
    content, cid = params[:cid], params[:content]
    $redis.hset "users:#{current_user.id}.autosave_entry", cid, content
    render json: {cid: cid, rc: 0}
  end
  
  def discard_entry
    $redis.hdel "users:#{current_user.id}.autosave_entry", params[:cid]
    render nothing: true
  end
end
