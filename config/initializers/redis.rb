$redis = Redis.new(:host => "localhost", :port => 6379)

class UUIDList
  def self.pop
    list_name = 'UUIDList'
    if $redis.llen(list_name) <= 100
      1000.times do
        uuid = ''
        2.times do
          uuid+=UUIDTools::UUID.random_create.to_i.to_s[0..7]
        end
        $redis.rpush(list_name, uuid)
      end
    end
    $redis.lpop(list_name)
  end
end
