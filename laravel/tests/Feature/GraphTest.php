<?php

namespace Tests\Feature;

use Nuwave\Lighthouse\Testing\ClearsSchemaCache;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\Subject;

class GraphTest extends TestCase
{
    /**
     * Create subject model and test graphql.
     *
     * @return void
     */

    public function test_create_query_destroy_subject(): void
    {
        $subject = Subject::factory()->create();
        //$this->testUserId = $subject->id;
        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                subject(id: ' . $subject->id . ') {
                    name
                }
            }
        '
        )->assertJson([
            'data' => [
                'subject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            mutation {
                deleteSubject(id: ' . $subject->id . ') {
                    name
                },
                createSubject(id: ' . $subject->id . ', name: ' . $subject->name . ', test_chamber: ' . $subject->test_chamber . ', date_of_birth: ' . $subject->date_of_birth . ', score: ' . $subject->score . ', alive: ' . $subject->alive . ', created_at: ' . $subject->create_at . ') {
                    name
                },
                updateSubject(id: ' . $subject->id . ', name: ' . $subject->name . ', test_chamber: ' . $subject->test_chamber . ', date_of_birth: ' . $subject->date_of_birth . ', score: ' . $subject->score . ', alive: ' . $subject->alive . ', updated_at: ' . $subject->create_at . ') {
                    name
                }
            }
        '
        )->assertJson([
            'data' => [
                'deleteSubject' => [
                    'name' => $subject->name,
                ],
                'createSubject' => [
                    'name' => $subject->name,
                ],
                'updateSubject' => [

                    'name' => $subject->name,
                ],
            ],
        ]);
    }

    /**
     * Try to query Users, be rejected.
     *
     * @return void
     */

    public function testQueryUsersProtected(): void
    {
        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                users {
                    data {
                        name
                    }
                }
            }
        '
        )->decodeResponseJson();

        $message = array_shift(json_decode($response->json)->errors)->message;
        $this->assertEquals($message, "Unauthenticated.");
    }

    /**
     * Try to query Users as authenticated user, be successful.
     *
     * @return void
     */

    public function testQueryUsersAuthenticated(): void
    {
        $user = User::factory()->make();

        Sanctum::actingAs(
            $user,
        );

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                users {
                    data {
                        name
                    }
                }
            }
        '
        )->decodeResponseJson();

        $users = json_decode($response->json)->data->users->data;
        $this->assertCount(1, $users);
    }
}
